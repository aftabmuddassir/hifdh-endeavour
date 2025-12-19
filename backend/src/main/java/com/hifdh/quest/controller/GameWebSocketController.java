package com.hifdh.quest.controller;

import com.hifdh.quest.dto.*;
import com.hifdh.quest.service.BuzzerService;
import com.hifdh.quest.service.GameSessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * WebSocket controller for real-time game events.
 * Handles buzzer presses, round updates, scoreboard changes, and timer sync.
 */
@Controller
@RequiredArgsConstructor
@Slf4j
public class GameWebSocketController {

    private final GameSessionService gameSessionService;
    private final BuzzerService buzzerService;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Handle buzzer press from a participant.
     * Client sends to: /app/game/{sessionId}/buzz
     * Broadcasts to: /topic/game/{sessionId}/buzzer
     */
    @MessageMapping("/game/{sessionId}/buzz")
    public void handleBuzzerPress(
            @DestinationVariable UUID sessionId,
            @Payload Map<String, Object> payload
    ) {
        try {
            Long roundId = Long.valueOf(payload.get("roundId").toString());
            Long participantId = Long.valueOf(payload.get("participantId").toString());

            log.info("Buzzer press from participant {} in round {}", participantId, roundId);

            // Process buzzer press
            BuzzerPressDTO buzzerPress = buzzerService.pressBuzzer(roundId, participantId);

            // Broadcast to all participants in this game
            messagingTemplate.convertAndSend(
                "/topic/game/" + sessionId + "/buzzer",
                Map.of(
                    "type", "BUZZER_PRESS",
                    "data", buzzerPress,
                    "timestamp", System.currentTimeMillis()
                )
            );

            // Also send updated buzzer queue
            List<BuzzerPressDTO> buzzerQueue = buzzerService.getBuzzerPressesForRound(roundId);
            messagingTemplate.convertAndSend(
                "/topic/game/" + sessionId + "/buzzer-queue",
                Map.of(
                    "type", "BUZZER_QUEUE_UPDATE",
                    "data", buzzerQueue,
                    "timestamp", System.currentTimeMillis()
                )
            );

        } catch (IllegalStateException | IllegalArgumentException e) {
            log.error("Buzzer press failed: {}", e.getMessage());

            // Send error to specific user
            messagingTemplate.convertAndSend(
                "/topic/game/" + sessionId + "/errors",
                Map.of(
                    "type", "BUZZER_ERROR",
                    "message", e.getMessage(),
                    "timestamp", System.currentTimeMillis()
                )
            );
        }
    }

    /**
     * Start a new round.
     * Client sends to: /app/game/{sessionId}/start-round
     * Broadcasts to: /topic/game/{sessionId}/round
     */
    @MessageMapping("/game/{sessionId}/start-round")
    public void handleStartRound(
            @DestinationVariable UUID sessionId,
            @Payload Map<String, Object> payload
    ) {
        try {
            String questionType = (String) payload.get("questionType");
            Long reciterId = payload.get("reciterId") != null ?
                Long.valueOf(payload.get("reciterId").toString()) : null;

            log.info("Starting new round for session {} with question type: {}", sessionId, questionType);

            // Create new round
            GameRoundDTO round = gameSessionService.createRound(sessionId, questionType, reciterId);

            // Reset buzzers for new round
            buzzerService.resetBuzzersForSession(sessionId);

            // Broadcast round start to all participants
            messagingTemplate.convertAndSend(
                "/topic/game/" + sessionId + "/round",
                Map.of(
                    "type", "ROUND_START",
                    "data", round,
                    "timestamp", System.currentTimeMillis()
                )
            );

        } catch (IllegalStateException | IllegalArgumentException e) {
            log.error("Failed to start round: {}", e.getMessage());
        }
    }

    /**
     * End the current round.
     * Client sends to: /app/game/{sessionId}/end-round
     * Broadcasts to: /topic/game/{sessionId}/round
     */
    @MessageMapping("/game/{sessionId}/end-round")
    public void handleEndRound(
            @DestinationVariable UUID sessionId,
            @Payload Map<String, Object> payload
    ) {
        try {
            Long roundId = Long.valueOf(payload.get("roundId").toString());

            log.info("Ending round {} for session {}", roundId, sessionId);

            GameRoundDTO round = gameSessionService.endRound(roundId);

            // Broadcast round end to all participants
            messagingTemplate.convertAndSend(
                "/topic/game/" + sessionId + "/round",
                Map.of(
                    "type", "ROUND_END",
                    "data", round,
                    "timestamp", System.currentTimeMillis()
                )
            );

        } catch (IllegalStateException | IllegalArgumentException e) {
            log.error("Failed to end round: {}", e.getMessage());
        }
    }

    /**
     * Update participant score.
     * Client sends to: /app/game/{sessionId}/score
     * Broadcasts to: /topic/game/{sessionId}/scoreboard
     */
    @MessageMapping("/game/{sessionId}/score")
    public void handleScoreUpdate(
            @DestinationVariable UUID sessionId,
            @Payload Map<String, Object> payload
    ) {
        try {
            Long participantId = Long.valueOf(payload.get("participantId").toString());
            Integer points = Integer.valueOf(payload.get("points").toString());

            log.info("Adding {} points to participant {}", points, participantId);

            // Update score
            ParticipantDTO participant = gameSessionService.addScore(participantId, points);

            // Get updated scoreboard
            List<ParticipantDTO> scoreboard = gameSessionService.getScoreboard(sessionId);

            // Broadcast updated scoreboard to all participants
            messagingTemplate.convertAndSend(
                "/topic/game/" + sessionId + "/scoreboard",
                Map.of(
                    "type", "SCOREBOARD_UPDATE",
                    "data", scoreboard,
                    "updatedParticipant", participant,
                    "timestamp", System.currentTimeMillis()
                )
            );

        } catch (IllegalArgumentException e) {
            log.error("Failed to update score: {}", e.getMessage());
        }
    }

    /**
     * Broadcast timer tick.
     * Client sends to: /app/game/{sessionId}/timer
     * Broadcasts to: /topic/game/{sessionId}/timer
     */
    @MessageMapping("/game/{sessionId}/timer")
    @SendTo("/topic/game/{sessionId}/timer")
    public Map<String, Object> handleTimerSync(@Payload Map<String, Object> payload) {
        // Timer sync message - just broadcast to all clients
        return Map.of(
            "type", "TIMER_TICK",
            "remainingSeconds", payload.get("remainingSeconds"),
            "timestamp", System.currentTimeMillis()
        );
    }

    /**
     * Give chance to next participant in buzzer queue.
     * Client sends to: /app/game/{sessionId}/give-chance
     * Broadcasts to: /topic/game/{sessionId}/buzzer
     */
    @MessageMapping("/game/{sessionId}/give-chance")
    public void handleGiveChance(
            @DestinationVariable UUID sessionId,
            @Payload Map<String, Object> payload
    ) {
        try {
            Long buzzerPressId = Long.valueOf(payload.get("buzzerPressId").toString());

            log.info("Giving chance to buzzer press {}", buzzerPressId);

            BuzzerPressDTO buzzerPress = buzzerService.markAsGotChance(buzzerPressId);

            // Broadcast who got the chance
            messagingTemplate.convertAndSend(
                "/topic/game/" + sessionId + "/buzzer",
                Map.of(
                    "type", "GOT_CHANCE",
                    "data", buzzerPress,
                    "timestamp", System.currentTimeMillis()
                )
            );

        } catch (IllegalArgumentException e) {
            log.error("Failed to give chance: {}", e.getMessage());
        }
    }

    /**
     * Record answer for a buzzer press.
     * Client sends to: /app/game/{sessionId}/answer
     * Broadcasts to: /topic/game/{sessionId}/answer
     */
    @MessageMapping("/game/{sessionId}/answer")
    public void handleAnswer(
            @DestinationVariable UUID sessionId,
            @Payload Map<String, Object> payload
    ) {
        try {
            Long buzzerPressId = Long.valueOf(payload.get("buzzerPressId").toString());
            String answerText = (String) payload.get("answerText");
            Boolean isCorrect = (Boolean) payload.get("isCorrect");

            log.info("Recording answer for buzzer press {} - correct: {}", buzzerPressId, isCorrect);

            BuzzerPressDTO buzzerPress = buzzerService.recordAnswer(buzzerPressId, answerText, isCorrect);

            // Broadcast answer result
            messagingTemplate.convertAndSend(
                "/topic/game/" + sessionId + "/answer",
                Map.of(
                    "type", "ANSWER_RECORDED",
                    "data", buzzerPress,
                    "timestamp", System.currentTimeMillis()
                )
            );

            // If answer was correct, add points and update scoreboard
            if (Boolean.TRUE.equals(isCorrect)) {
                String questionType = (String) payload.get("questionType");
                Integer points = gameSessionService.getQuestionPoints(questionType);

                if (points != null && points > 0) {
                    ParticipantDTO participant = gameSessionService.addScore(
                        buzzerPress.getParticipantId(),
                        points
                    );

                    // Broadcast updated scoreboard
                    List<ParticipantDTO> scoreboard = gameSessionService.getScoreboard(sessionId);
                    messagingTemplate.convertAndSend(
                        "/topic/game/" + sessionId + "/scoreboard",
                        Map.of(
                            "type", "SCOREBOARD_UPDATE",
                            "data", scoreboard,
                            "updatedParticipant", participant,
                            "timestamp", System.currentTimeMillis()
                        )
                    );
                }
            }

        } catch (IllegalArgumentException e) {
            log.error("Failed to record answer: {}", e.getMessage());
        }
    }

    /**
     * Game status change (started, ended, etc.).
     * Client sends to: /app/game/{sessionId}/status
     * Broadcasts to: /topic/game/{sessionId}/status
     */
    @MessageMapping("/game/{sessionId}/status")
    @SendTo("/topic/game/{sessionId}/status")
    public Map<String, Object> handleGameStatus(@Payload Map<String, Object> payload) {
        String status = (String) payload.get("status");

        log.info("Game status changed to: {}", status);

        return Map.of(
            "type", "GAME_STATUS_CHANGE",
            "status", status,
            "timestamp", System.currentTimeMillis()
        );
    }

    /**
     * Test WebSocket connection.
     * Client sends to: /app/test
     * Broadcasts to: /topic/test
     */
    @MessageMapping("/test")
    @SendTo("/topic/test")
    public Map<String, Object> handleTest(@Payload Map<String, String> message) {
        log.info("WebSocket test message received: {}", message.get("message"));

        return Map.of(
            "type", "TEST_RESPONSE",
            "message", "Server received: " + message.get("message"),
            "timestamp", System.currentTimeMillis()
        );
    }
}

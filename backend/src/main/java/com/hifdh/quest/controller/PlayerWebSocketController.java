package com.hifdh.quest.controller;

import com.hifdh.quest.dto.websocket.*;
import com.hifdh.quest.model.BuzzerPress;
import com.hifdh.quest.model.GameParticipant;
import com.hifdh.quest.repository.GameParticipantRepository;
import com.hifdh.quest.service.BuzzerService;
import com.hifdh.quest.service.ConsecutiveBuzzTracker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

/**
 * WebSocket controller for player-side game actions.
 * Handles buzzer presses, answer submissions, and heartbeats from players.
 */
@Controller
@RequiredArgsConstructor
@Slf4j
public class PlayerWebSocketController {

    private final BuzzerService buzzerService;
    private final GameParticipantRepository participantRepository;
    private final ConsecutiveBuzzTracker consecutiveBuzzTracker;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Handle buzzer press from a player.
     * Client sends to: /app/player/buzz
     *
     * Validates the press, assigns rank, broadcasts BuzzerPressedEvent.
     */
    @MessageMapping("/player/buzz")
    public void handleBuzzerPress(@Payload BuzzerPressRequest request) {
        try {
            log.info("🔔 Received buzzer press: participant={}, round={}, sessionId={}, elapsed={}s",
                request.getParticipantId(), request.getRoundId(), request.getSessionId(),
                request.getClientElapsedSeconds());

            // Process buzzer press (this also broadcasts the event)
            BuzzerPressedEvent event = buzzerService.handleBuzzerPress(request);

            // Update consecutive buzz tracking
            consecutiveBuzzTracker.updateTracking(request.getParticipantId(), event.getBuzzRank());

            log.info("✅ Buzzer press processed successfully: rank={}, participant={}",
                event.getBuzzRank(), event.getParticipantName());

        } catch (IllegalStateException | IllegalArgumentException e) {
            log.error("❌ Buzzer press failed for participant {}: {}",
                request.getParticipantId(), e.getMessage());

            // Send error message to all players (so they see error feedback)
            sendErrorToSession(request.getSessionId(), "BUZZER_ERROR",
                "Buzzer press failed: " + e.getMessage());
        } catch (Exception e) {
            log.error("❌ Unexpected error processing buzzer press", e);
        }
    }

    /**
     * Handle answer submission from a player.
     * Client sends to: /app/player/submit-answer
     *
     * Saves the answer text and timestamp.
     */
    @MessageMapping("/player/submit-answer")
    public void handleSubmitAnswer(@Payload SubmitAnswerRequest request) {
        try {
            log.info("Player answer submission: participant={}, round={}, answer={}",
                request.getParticipantId(), request.getRoundId(), request.getAnswerText());

            // Find the buzzer press for this participant and round
            Long buzzerPressId = findBuzzerPressId(request.getParticipantId(), request.getRoundId());

            if (buzzerPressId == null) {
                throw new IllegalStateException("No buzzer press found for this participant in this round");
            }

            // Submit answer
            BuzzerPress buzzerPress = buzzerService.submitAnswer(buzzerPressId, request.getAnswerText());

            log.info("Answer submitted successfully: buzzerPressId={}, answer={}",
                buzzerPressId, request.getAnswerText());

            // Optionally, you could broadcast an event here to notify the admin
            // that an answer was submitted (for future enhancement)

        } catch (IllegalStateException | IllegalArgumentException e) {
            log.error("Answer submission failed for participant {}: {}",
                request.getParticipantId(), e.getMessage());

            sendErrorToSession(request.getSessionId(), "ANSWER_SUBMIT_ERROR",
                "Answer submission failed: " + e.getMessage());
        }
    }

    /**
     * Handle heartbeat from a player.
     * Client sends to: /app/player/heartbeat
     *
     * Updates last_heartbeat timestamp and connection status.
     */
    @MessageMapping("/player/heartbeat")
    public void handleHeartbeat(@Payload HeartbeatRequest request) {
        try {
            GameParticipant participant = participantRepository.findById(request.getParticipantId())
                .orElseThrow(() -> new IllegalArgumentException("Participant not found: " + request.getParticipantId()));

            // Update heartbeat timestamp
            participant.setLastHeartbeat(LocalDateTime.now());

            // Ensure participant is marked as connected
            if (!participant.getIsConnected()) {
                participant.setIsConnected(true);
                participantRepository.save(participant);

                // Broadcast reconnection event
                log.info("Participant {} reconnected", participant.getName());
                // Future: broadcast PlayerReconnectedEvent
            } else {
                participantRepository.save(participant);
            }

            // Log heartbeat at trace level (very frequent, so don't spam logs)
            log.trace("Heartbeat received from participant {}", request.getParticipantId());

        } catch (IllegalArgumentException e) {
            log.error("Heartbeat failed for participant {}: {}",
                request.getParticipantId(), e.getMessage());
        }
    }

    /**
     * Find buzzer press ID for a participant in a round.
     * Helper method to locate the buzzer press record.
     *
     * @param participantId Participant ID
     * @param roundId Round ID (as string)
     * @return Buzzer press ID or null if not found
     */
    private Long findBuzzerPressId(Long participantId, String roundId) {
        Long roundIdLong = Long.parseLong(roundId);
        var buzzerPresses = buzzerService.getRoundBuzzes(roundIdLong);

        return buzzerPresses.stream()
            .filter(bp -> bp.getParticipant().getId().equals(participantId))
            .map(BuzzerPress::getId)
            .findFirst()
            .orElse(null);
    }

    /**
     * Send error message to all players in a session.
     *
     * @param sessionId Session ID
     * @param errorType Error type
     * @param message Error message
     */
    private void sendErrorToSession(String sessionId, String errorType, String message) {
        String destination = "/topic/game/" + sessionId + "/errors";
        messagingTemplate.convertAndSend(destination, java.util.Map.of(
            "type", errorType,
            "message", message,
            "timestamp", java.time.Instant.now().toString()
        ));
    }
}

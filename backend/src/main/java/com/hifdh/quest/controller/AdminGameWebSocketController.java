package com.hifdh.quest.controller;

import com.hifdh.quest.dto.GameRoundDTO;
import com.hifdh.quest.dto.ParticipantDTO;
import com.hifdh.quest.dto.websocket.AnswerValidatedEvent;
import com.hifdh.quest.dto.websocket.ScoreboardUpdateEvent;
import com.hifdh.quest.model.GameParticipant;
import com.hifdh.quest.repository.GameParticipantRepository;
import com.hifdh.quest.service.GameSessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * WebSocket controller for admin game control actions.
 * Handles round creation, answer validation, and game management.
 */
@Controller
@RequiredArgsConstructor
@Slf4j
public class AdminGameWebSocketController {

    private final GameSessionService gameSessionService;
    private final GameParticipantRepository participantRepository;

    /**
     * Start a new round.
     * Client sends to: /app/admin/start-round
     * Broadcasts ROUND_STARTED event via GameSessionService
     */
    @MessageMapping("/admin/start-round")
    public void handleStartRound(@Payload Map<String, Object> payload) {
        try {
            String sessionId = (String) payload.get("sessionId");
            String questionType = (String) payload.get("questionType");
            Long reciterId = payload.get("reciterId") != null
                ? Long.valueOf(payload.get("reciterId").toString())
                : null;

            log.info("Admin starting new round for session {} with question type: {}", sessionId, questionType);

            // Create new round (service handles buzzer reset and ROUND_STARTED broadcast)
            gameSessionService.createRound(UUID.fromString(sessionId), questionType, reciterId);

        } catch (IllegalStateException | IllegalArgumentException e) {
            log.error("Failed to start round: {}", e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error starting round", e);
        }
    }

    /**
     * Validate a player's answer.
     * Client sends to: /app/admin/validate-answer
     * Broadcasts ANSWER_VALIDATED and SCOREBOARD_UPDATE events
     */
    @MessageMapping("/admin/validate-answer")
    public void handleValidateAnswer(@Payload Map<String, Object> payload) {
        try {
            String sessionId = (String) payload.get("sessionId");
            String roundId = (String) payload.get("roundId");
            Long participantId = Long.valueOf(payload.get("participantId").toString());
            Boolean isCorrect = (Boolean) payload.get("isCorrect");
            Integer pointsAwarded = Integer.valueOf(payload.get("pointsAwarded").toString());

            log.info("Admin validating answer for participant {} in round {}: correct={}, points={}",
                participantId, roundId, isCorrect, pointsAwarded);

            // Get participant name
            GameParticipant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new IllegalArgumentException("Participant not found: " + participantId));

            // Award points if correct
            int newTotalScore = participant.getTotalScore();
            if (Boolean.TRUE.equals(isCorrect) && pointsAwarded > 0) {
                ParticipantDTO updatedParticipant = gameSessionService.addScore(participantId, pointsAwarded);
                newTotalScore = updatedParticipant.getTotalScore();
                log.info("Awarded {} points to participant {} (new total: {})",
                    pointsAwarded, participant.getName(), newTotalScore);
            }

            // Broadcast ANSWER_VALIDATED event
            AnswerValidatedEvent answerEvent = AnswerValidatedEvent.builder()
                .sessionId(sessionId)
                .participantId(participantId)
                .participantName(participant.getName())
                .isCorrect(isCorrect)
                .basePoints(isCorrect ? pointsAwarded : 0)
                .totalPoints(isCorrect ? pointsAwarded : 0)
                .timeMultiplier(1.0)
                .timeBonusPoints(0)
                .buzzRankBonus(0)
                .adminBonusPoints(0)
                .feedback(null)
                .build();

            gameSessionService.broadcastAnswerValidated(answerEvent);

            // Broadcast updated scoreboard
            List<ParticipantDTO> scoreboard = gameSessionService.getScoreboard(UUID.fromString(sessionId));

            ScoreboardUpdateEvent scoreboardEvent = ScoreboardUpdateEvent.builder()
                .sessionId(sessionId)
                .scores(scoreboard.stream()
                    .map(p -> ScoreboardUpdateEvent.PlayerScore.builder()
                        .participantId(p.getId())
                        .participantName(p.getName())
                        .totalScore(p.getTotalScore())
                        .rank(null) // Rank can be calculated on frontend
                        .roundsWon(0) // Not tracked yet
                        .isConnected(true) // Default value since not in DTO
                        .isBlockedNextRound(false) // Default value since not in DTO
                        .build())
                    .collect(Collectors.toList()))
                .build();

            gameSessionService.broadcastScoreboardUpdate(scoreboardEvent);

        } catch (IllegalArgumentException e) {
            log.error("Failed to validate answer: {}", e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error validating answer", e);
        }
    }

    /**
     * End the current round.
     * Client sends to: /app/admin/end-round
     * Broadcasts ROUND_ENDED event to all players
     */
    @MessageMapping("/admin/end-round")
    public void handleEndRound(@Payload Map<String, Object> payload) {
        try {
            String sessionId = (String) payload.get("sessionId");
            Long roundId = Long.valueOf(payload.get("roundId").toString());

            log.info("Admin ending round {} for session {}", roundId, sessionId);

            GameRoundDTO round = gameSessionService.endRound(roundId);

            // Broadcast ROUND_ENDED event to all players
            gameSessionService.broadcastRoundEnded(sessionId, roundId);

            log.info("Round {} ended successfully", roundId);

        } catch (IllegalStateException | IllegalArgumentException e) {
            log.error("Failed to end round: {}", e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error ending round", e);
        }
    }
}

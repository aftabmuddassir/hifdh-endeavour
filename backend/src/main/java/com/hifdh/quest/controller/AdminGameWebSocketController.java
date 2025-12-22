package com.hifdh.quest.controller;

import com.hifdh.quest.dto.GameRoundDTO;
import com.hifdh.quest.dto.ParticipantDTO;
import com.hifdh.quest.dto.websocket.AnswerValidatedEvent;
import com.hifdh.quest.dto.websocket.ScoreboardUpdateEvent;
import com.hifdh.quest.model.BuzzerPress;
import com.hifdh.quest.model.GameParticipant;
import com.hifdh.quest.model.GameRound;
import com.hifdh.quest.repository.BuzzerPressRepository;
import com.hifdh.quest.repository.GameParticipantRepository;
import com.hifdh.quest.repository.GameRoundRepository;
import com.hifdh.quest.service.GameSessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.math.BigDecimal;
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
    private final GameRoundRepository roundRepository;
    private final BuzzerPressRepository buzzerPressRepository;

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
     * Validate a player's answer with advanced scoring system.
     * Client sends to: /app/admin/validate-answer
     * Broadcasts ANSWER_VALIDATED and SCOREBOARD_UPDATE events
     *
     * Scoring System:
     * - Base Points: 100 (Surah), 150 (Meaning), 200 (Next Ayat), 250 (Previous Ayat)
     * - Speed Bonus: 1.5x (<7s), 1.2x (<14s), 1.0x (>14s)
     * - Streak Bonus: +50 (3 correct), +100 (5 correct), +250 (10 correct)
     * - Buzz Rank Bonus: +25 (1st), +10 (2nd)
     */
    @MessageMapping("/admin/validate-answer")
    public void handleValidateAnswer(@Payload Map<String, Object> payload) {
        try {
            String sessionId = (String) payload.get("sessionId");
            Long roundIdLong = Long.valueOf(payload.get("roundId").toString());
            Long participantId = Long.valueOf(payload.get("participantId").toString());
            Boolean isCorrect = (Boolean) payload.get("isCorrect");

            log.info("Admin validating answer for participant {} in round {}: correct={}",
                participantId, roundIdLong, isCorrect);

            // Get round to determine question type
            GameRound round = roundRepository.findById(roundIdLong)
                .orElseThrow(() -> new IllegalArgumentException("Round not found: " + roundIdLong));

            // Get buzzer press to determine buzz time and rank
            List<BuzzerPress> buzzerPresses = buzzerPressRepository.findByParticipantIdAndRoundId(participantId, roundIdLong);
            BuzzerPress buzzerPress = buzzerPresses.isEmpty() ? null : buzzerPresses.get(0);

            int totalPoints = 0;
            int basePoints = 0;
            double speedMultiplier = 1.0;
            int timeBonusPoints = 0;
            int streakBonus = 0;
            int buzzRankBonus = 0;

            // Get participant for name and streak calculation
            GameParticipant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new IllegalArgumentException("Participant not found: " + participantId));

            if (Boolean.TRUE.equals(isCorrect)) {
                // 1. Calculate base points based on question type
                basePoints = getBasePoints(round.getCurrentQuestionType());

                // 2. Apply speed bonus multiplier
                if (buzzerPress != null && buzzerPress.getBuzzedAtSeconds() != null) {
                    double buzzTime = buzzerPress.getBuzzedAtSeconds().doubleValue();
                    if (buzzTime < 7.0) {
                        speedMultiplier = 1.5;
                    } else if (buzzTime < 14.0) {
                        speedMultiplier = 1.2;
                    }
                }

                // Calculate points after speed multiplier
                int pointsAfterSpeed = (int) Math.round(basePoints * speedMultiplier);
                timeBonusPoints = pointsAfterSpeed - basePoints;

                // 3. Add accuracy streak bonus
                int currentStreak = participant.getConsecutiveCorrectAnswers() + 1; // +1 for this correct answer
                if (currentStreak >= 10) {
                    streakBonus = 250;
                } else if (currentStreak >= 5) {
                    streakBonus = 100;
                } else if (currentStreak >= 3) {
                    streakBonus = 50;
                }

                // 4. Add buzz rank bonus
                if (buzzerPress != null && buzzerPress.getBuzzRank() != null) {
                    if (buzzerPress.getBuzzRank() == 1) {
                        buzzRankBonus = 25;
                    } else if (buzzerPress.getBuzzRank() == 2) {
                        buzzRankBonus = 10;
                    }
                }

                // Total points calculation
                totalPoints = pointsAfterSpeed + streakBonus + buzzRankBonus;

                // Update participant streak and award points
                participant.setConsecutiveCorrectAnswers(currentStreak);
                participant.setTotalScore(participant.getTotalScore() + totalPoints);
                participant = participantRepository.save(participant);

                log.info("✅ Awarded {} points to {}: base={}, speed={}x, timebonus={}, streak={}, buzzbonus={}, total={}",
                    totalPoints, participant.getName(), basePoints, speedMultiplier, timeBonusPoints,
                    streakBonus, buzzRankBonus, participant.getTotalScore());
            } else {
                // Wrong answer: reset streak
                participant.setConsecutiveCorrectAnswers(0);
                participant = participantRepository.save(participant);
                log.info("❌ Wrong answer from {} - streak reset", participant.getName());
            }

            // Broadcast ANSWER_VALIDATED event
            AnswerValidatedEvent answerEvent = AnswerValidatedEvent.builder()
                .sessionId(sessionId)
                .participantId(participantId)
                .participantName(participant.getName())
                .isCorrect(isCorrect)
                .basePoints(basePoints)
                .totalPoints(totalPoints)
                .timeMultiplier(speedMultiplier)
                .timeBonusPoints(timeBonusPoints)
                .buzzRankBonus(buzzRankBonus)
                .adminBonusPoints(streakBonus) // Using adminBonusPoints field for streak bonus
                .feedback(buildFeedbackMessage(isCorrect, totalPoints, speedMultiplier, streakBonus, buzzRankBonus))
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
     * Get base points for a question type.
     */
    private int getBasePoints(String questionType) {
        return switch (questionType) {
            case "guess_surah" -> 100;
            case "guess_meaning" -> 150;
            case "guess_next_ayat" -> 200;
            case "guess_previous_ayat" -> 250;
            case "guess_reciter" -> 150;
            default -> 100;
        };
    }

    /**
     * Build a feedback message showing point breakdown.
     */
    private String buildFeedbackMessage(boolean isCorrect, int totalPoints, double speedMultiplier,
                                       int streakBonus, int buzzRankBonus) {
        if (!isCorrect) {
            return "Better luck next time!";
        }

        StringBuilder feedback = new StringBuilder("Great job! ");

        if (speedMultiplier > 1.0) {
            feedback.append(String.format("⚡ %.1fx speed bonus! ", speedMultiplier));
        }

        if (streakBonus > 0) {
            feedback.append(String.format("🔥 +%d streak bonus! ", streakBonus));
        }

        if (buzzRankBonus > 0) {
            feedback.append(String.format("🏆 +%d buzz bonus! ", buzzRankBonus));
        }

        return feedback.toString().trim();
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

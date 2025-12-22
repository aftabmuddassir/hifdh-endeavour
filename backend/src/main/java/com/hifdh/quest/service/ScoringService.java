package com.hifdh.quest.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

/**
 * Service for calculating points for correct answers.
 * Handles base points, time bonuses, and buzz rank bonuses.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ScoringService {

    // Base points for each question type
    private static final Map<String, Integer> QUESTION_BASE_POINTS = Map.of(
        "guess_surah", 100,
        "guess_meaning", 150,
        "guess_next_ayat", 200,
        "guess_previous_ayat", 250
    );

    // Time-based multipliers (based on buzz time in seconds)
    private static final double FAST_BUZZ_THRESHOLD = 5.0;  // < 5s = 1.5x
    private static final double MED_BUZZ_THRESHOLD = 10.0;   // 5-10s = 1.2x
    // > 10s = 1.0x (no bonus)

    private static final double FAST_MULTIPLIER = 1.5;
    private static final double MED_MULTIPLIER = 1.2;
    private static final double SLOW_MULTIPLIER = 1.0;

    // Buzz rank bonuses
    private static final int FIRST_BUZZ_BONUS = 25;
    private static final int SECOND_BUZZ_BONUS = 10;
    private static final int THIRD_BUZZ_BONUS = 0;

    /**
     * Calculate total points for a correct answer.
     *
     * @param questionType Question type (e.g., "guess_surah")
     * @param buzzTimeSeconds Time when buzzer was pressed (in seconds from round start)
     * @param buzzRank Buzz rank (1, 2, or 3)
     * @param adminBonusPoints Optional bonus points awarded by admin
     * @return ScoreBreakdown with all point calculations
     */
    public ScoreBreakdown calculatePoints(String questionType, BigDecimal buzzTimeSeconds,
                                          Integer buzzRank, Integer adminBonusPoints) {

        // Get base points for question type
        int basePoints = QUESTION_BASE_POINTS.getOrDefault(questionType, 100);

        // Calculate time multiplier
        double timeMultiplier = calculateTimeMultiplier(buzzTimeSeconds);

        // Calculate time bonus points
        int timeBonusPoints = (int) Math.round(basePoints * (timeMultiplier - 1.0));

        // Get buzz rank bonus
        int buzzRankBonus = calculateBuzzRankBonus(buzzRank);

        // Admin bonus (0 if null)
        int bonusPoints = adminBonusPoints != null ? adminBonusPoints : 0;

        // Calculate total points
        int totalPoints = (int) Math.round(basePoints * timeMultiplier) + buzzRankBonus + bonusPoints;

        log.debug("Points calculated: base={}, timeMult={}, timeBonus={}, rankBonus={}, adminBonus={}, total={}",
            basePoints, timeMultiplier, timeBonusPoints, buzzRankBonus, bonusPoints, totalPoints);

        return ScoreBreakdown.builder()
            .basePoints(basePoints)
            .timeMultiplier(timeMultiplier)
            .timeBonusPoints(timeBonusPoints)
            .buzzRankBonus(buzzRankBonus)
            .adminBonusPoints(bonusPoints)
            .totalPoints(totalPoints)
            .build();
    }

    /**
     * Calculate time multiplier based on buzz time.
     *
     * @param buzzTimeSeconds Buzz time in seconds
     * @return Multiplier (1.0, 1.2, or 1.5)
     */
    private double calculateTimeMultiplier(BigDecimal buzzTimeSeconds) {
        if (buzzTimeSeconds == null) {
            return SLOW_MULTIPLIER;
        }

        double buzzTime = buzzTimeSeconds.doubleValue();

        if (buzzTime < FAST_BUZZ_THRESHOLD) {
            return FAST_MULTIPLIER;  // < 5s = 1.5x
        } else if (buzzTime < MED_BUZZ_THRESHOLD) {
            return MED_MULTIPLIER;   // 5-10s = 1.2x
        } else {
            return SLOW_MULTIPLIER;  // > 10s = 1.0x
        }
    }

    /**
     * Calculate buzz rank bonus.
     *
     * @param buzzRank Buzz rank (1, 2, or 3+)
     * @return Bonus points
     */
    private int calculateBuzzRankBonus(Integer buzzRank) {
        if (buzzRank == null) {
            return 0;
        }

        return switch (buzzRank) {
            case 1 -> FIRST_BUZZ_BONUS;   // 1st = +25
            case 2 -> SECOND_BUZZ_BONUS;  // 2nd = +10
            default -> THIRD_BUZZ_BONUS;  // 3rd+ = 0
        };
    }

    /**
     * Get base points for a question type.
     *
     * @param questionType Question type
     * @return Base points
     */
    public int getBasePoints(String questionType) {
        return QUESTION_BASE_POINTS.getOrDefault(questionType, 100);
    }

    /**
     * Score breakdown result class.
     */
    @lombok.Data
    @lombok.Builder
    public static class ScoreBreakdown {
        private int basePoints;
        private double timeMultiplier;
        private int timeBonusPoints;
        private int buzzRankBonus;
        private int adminBonusPoints;
        private int totalPoints;
    }
}

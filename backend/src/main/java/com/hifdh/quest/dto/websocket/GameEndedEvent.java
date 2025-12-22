package com.hifdh.quest.dto.websocket;

import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

/**
 * Event broadcast when game session ends (either by admin or reaching round limit).
 * Contains final results and statistics.
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class GameEndedEvent extends GameEvent {
    private String reason; // "ADMIN_ENDED" or "ROUND_LIMIT_REACHED"
    private Integer totalRoundsPlayed;
    private List<FinalScore> finalScores;
    private Long winnerId;
    private String winnerName;

    @Builder
    public GameEndedEvent(String sessionId, String reason, Integer totalRoundsPlayed,
                         List<FinalScore> finalScores, Long winnerId, String winnerName) {
        super("GAME_ENDED", sessionId);
        this.reason = reason;
        this.totalRoundsPlayed = totalRoundsPlayed;
        this.finalScores = finalScores;
        this.winnerId = winnerId;
        this.winnerName = winnerName;
    }

    @Data
    @Builder
    public static class FinalScore {
        private Long participantId;
        private String participantName;
        private Integer totalScore;
        private Integer rank;
        private Integer roundsWon;
        private Integer totalBuzzes;
        private Integer correctAnswers;
    }
}

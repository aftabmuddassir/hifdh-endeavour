package com.hifdh.quest.dto.websocket;

import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

/**
 * Event broadcast with live scoreboard updates.
 * Sent after answer validation, bonus awards, or round completion.
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ScoreboardUpdateEvent extends GameEvent {
    private List<PlayerScore> scores;

    @Builder
    public ScoreboardUpdateEvent(String sessionId, List<PlayerScore> scores) {
        super("SCOREBOARD_UPDATE", sessionId);
        this.scores = scores;
    }

    @Data
    @Builder
    public static class PlayerScore {
        private Long participantId;
        private String participantName;
        private Integer totalScore;
        private Integer rank;
        private Integer roundsWon;
        private Boolean isConnected;
        private Boolean isBlockedNextRound;
    }
}

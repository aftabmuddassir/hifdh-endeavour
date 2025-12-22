package com.hifdh.quest.dto.websocket;

import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * Event broadcast when admin awards bonus points to a player.
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class BonusAwardedEvent extends GameEvent {
    private Long participantId;
    private String participantName;
    private Integer bonusPoints;
    private String reason;

    @Builder
    public BonusAwardedEvent(String sessionId, Long participantId, String participantName,
                            Integer bonusPoints, String reason) {
        super("BONUS_AWARDED", sessionId);
        this.participantId = participantId;
        this.participantName = participantName;
        this.bonusPoints = bonusPoints;
        this.reason = reason;
    }
}

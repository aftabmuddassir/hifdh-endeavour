package com.hifdh.quest.dto.websocket;

import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * Event broadcast when admin is ready to start the next round.
 * Gives players a brief moment to prepare.
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class NextRoundReadyEvent extends GameEvent {
    private Integer nextRoundNumber;
    private Integer countdownSeconds; // e.g., 3 seconds before round starts

    @Builder
    public NextRoundReadyEvent(String sessionId, Integer nextRoundNumber, Integer countdownSeconds) {
        super("NEXT_ROUND_READY", sessionId);
        this.nextRoundNumber = nextRoundNumber;
        this.countdownSeconds = countdownSeconds;
    }
}

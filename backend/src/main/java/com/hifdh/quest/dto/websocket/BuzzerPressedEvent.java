package com.hifdh.quest.dto.websocket;

import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.Instant;

/**
 * Event broadcast to all players when someone presses the buzzer.
 * Shows buzz order and remaining slots.
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class BuzzerPressedEvent extends GameEvent {
    private Long participantId;
    private String participantName;
    private Integer buzzRank;
    private Double buzzTimeSeconds;
    private Integer totalBuzzesAllowed;
    private Integer remainingSlots;
    private Instant buzzerPressedAt;

    @Builder
    public BuzzerPressedEvent(String sessionId, Long participantId, String participantName,
                             Integer buzzRank, Double buzzTimeSeconds, Integer totalBuzzesAllowed,
                             Integer remainingSlots, Instant buzzerPressedAt) {
        super("BUZZER_PRESSED", sessionId);
        this.participantId = participantId;
        this.participantName = participantName;
        this.buzzRank = buzzRank;
        this.buzzTimeSeconds = buzzTimeSeconds;
        this.totalBuzzesAllowed = totalBuzzesAllowed;
        this.remainingSlots = remainingSlots;
        this.buzzerPressedAt = buzzerPressedAt;
    }
}

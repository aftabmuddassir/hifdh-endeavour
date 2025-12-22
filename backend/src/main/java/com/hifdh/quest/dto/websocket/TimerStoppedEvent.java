package com.hifdh.quest.dto.websocket;

import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * Event broadcast when buzzer timer expires or all slots are filled.
 * Signals end of buzzing phase.
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class TimerStoppedEvent extends GameEvent {
    private String reason; // "TIMER_EXPIRED" or "ALL_SLOTS_FILLED"
    private Integer totalBuzzes;

    @Builder
    public TimerStoppedEvent(String sessionId, String reason, Integer totalBuzzes) {
        super("TIMER_STOPPED", sessionId);
        this.reason = reason;
        this.totalBuzzes = totalBuzzes;
    }
}

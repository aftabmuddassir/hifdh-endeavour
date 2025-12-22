package com.hifdh.quest.dto.websocket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Request sent from player when they press the buzzer button.
 * Includes client timestamp for time calculation.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BuzzerPressRequest {
    private String sessionId;
    private Long participantId;
    private String roundId;
    private Instant clientTimestamp;
    private Double clientElapsedSeconds; // Client-calculated time since timer started
}

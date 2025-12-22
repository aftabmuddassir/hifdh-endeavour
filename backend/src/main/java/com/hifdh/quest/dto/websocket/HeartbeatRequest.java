package com.hifdh.quest.dto.websocket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Periodic heartbeat sent from player to maintain connection status.
 * Sent every 5 seconds to update last_heartbeat timestamp.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HeartbeatRequest {
    private String sessionId;
    private Long participantId;
    private Instant clientTimestamp;
}

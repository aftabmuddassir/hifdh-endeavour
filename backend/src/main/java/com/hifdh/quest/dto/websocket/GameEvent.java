package com.hifdh.quest.dto.websocket;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Base class for all WebSocket game events.
 * All events sent from server to players extend this class.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public abstract class GameEvent {
    private String type;
    private String sessionId;
    private Instant timestamp = Instant.now();

    protected GameEvent(String type, String sessionId) {
        this.type = type;
        this.sessionId = sessionId;
        this.timestamp = Instant.now();
    }
}

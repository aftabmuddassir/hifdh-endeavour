package com.hifdh.quest.dto.websocket;

import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * Event broadcast when a previously disconnected player reconnects.
 * Notifies other players of reconnection.
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class PlayerReconnectedEvent extends GameEvent {
    private Long participantId;
    private String participantName;

    @Builder
    public PlayerReconnectedEvent(String sessionId, Long participantId, String participantName) {
        super("PLAYER_RECONNECTED", sessionId);
        this.participantId = participantId;
        this.participantName = participantName;
    }
}

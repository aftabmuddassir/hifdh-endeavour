package com.hifdh.quest.dto.websocket;

import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * Event broadcast when a player's WebSocket connection is lost.
 * Notifies other players of disconnection.
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class PlayerDisconnectedEvent extends GameEvent {
    private Long participantId;
    private String participantName;

    @Builder
    public PlayerDisconnectedEvent(String sessionId, Long participantId, String participantName) {
        super("PLAYER_DISCONNECTED", sessionId);
        this.participantId = participantId;
        this.participantName = participantName;
    }
}

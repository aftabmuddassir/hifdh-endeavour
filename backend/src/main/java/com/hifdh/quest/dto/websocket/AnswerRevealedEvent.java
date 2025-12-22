package com.hifdh.quest.dto.websocket;

import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * Event broadcast when all players answer incorrectly.
 * Reveals the correct answer to all players.
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class AnswerRevealedEvent extends GameEvent {
    private String correctAnswer;
    private String explanation; // Optional explanation from admin

    @Builder
    public AnswerRevealedEvent(String sessionId, String correctAnswer, String explanation) {
        super("ANSWER_REVEALED", sessionId);
        this.correctAnswer = correctAnswer;
        this.explanation = explanation;
    }
}

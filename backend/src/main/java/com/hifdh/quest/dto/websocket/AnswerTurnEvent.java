package com.hifdh.quest.dto.websocket;

import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * Event sent to a specific player when it's their turn to answer.
 * Sent in buzz-rank order after buzzing phase ends.
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class AnswerTurnEvent extends GameEvent {
    private Long participantId;
    private String participantName;
    private Integer buzzRank;
    private Integer answerTimeoutSeconds; // 30 seconds default
    private Boolean allowTextAnswer;

    @Builder
    public AnswerTurnEvent(String sessionId, Long participantId, String participantName,
                          Integer buzzRank, Integer answerTimeoutSeconds, Boolean allowTextAnswer) {
        super("ANSWER_TURN", sessionId);
        this.participantId = participantId;
        this.participantName = participantName;
        this.buzzRank = buzzRank;
        this.answerTimeoutSeconds = answerTimeoutSeconds;
        this.allowTextAnswer = allowTextAnswer;
    }
}

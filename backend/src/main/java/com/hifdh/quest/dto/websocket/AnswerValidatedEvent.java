package com.hifdh.quest.dto.websocket;

import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * Event broadcast after admin validates an answer.
 * Contains points breakdown and whether answer was correct.
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class AnswerValidatedEvent extends GameEvent {
    private Long participantId;
    private String participantName;
    private Boolean isCorrect;
    private Integer basePoints;
    private Double timeMultiplier;
    private Integer timeBonusPoints;
    private Integer buzzRankBonus;
    private Integer adminBonusPoints;
    private Integer totalPoints;
    private String feedback; // Optional admin message

    @Builder
    public AnswerValidatedEvent(String sessionId, Long participantId, String participantName,
                                Boolean isCorrect, Integer basePoints, Double timeMultiplier,
                                Integer timeBonusPoints, Integer buzzRankBonus,
                                Integer adminBonusPoints, Integer totalPoints, String feedback) {
        super("ANSWER_VALIDATED", sessionId);
        this.participantId = participantId;
        this.participantName = participantName;
        this.isCorrect = isCorrect;
        this.basePoints = basePoints;
        this.timeMultiplier = timeMultiplier;
        this.timeBonusPoints = timeBonusPoints;
        this.buzzRankBonus = buzzRankBonus;
        this.adminBonusPoints = adminBonusPoints;
        this.totalPoints = totalPoints;
        this.feedback = feedback;
    }
}

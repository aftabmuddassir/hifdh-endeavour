package com.hifdh.quest.dto;

import com.hifdh.quest.model.BuzzerPress;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for buzzer press data.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BuzzerPressDTO {

    private Long id;
    private Long roundId;
    private Long participantId;
    private String participantName;
    private LocalDateTime pressedAt;
    private Integer buzzRank;
    private BigDecimal buzzedAtSeconds;
    private Boolean gotChanceToAnswer;
    private String answerText;
    private LocalDateTime answerSubmittedAt;
    private Boolean isCorrect;
    private Integer pointsAwarded;

    /**
     * Convert BuzzerPress entity to DTO.
     *
     * @param buzzerPress BuzzerPress entity
     * @return BuzzerPressDTO
     */
    public static BuzzerPressDTO fromEntity(BuzzerPress buzzerPress) {
        if (buzzerPress == null) {
            return null;
        }

        return BuzzerPressDTO.builder()
            .id(buzzerPress.getId())
            .roundId(buzzerPress.getRound().getId())
            .participantId(buzzerPress.getParticipant().getId())
            .participantName(buzzerPress.getParticipant().getName())
            .pressedAt(buzzerPress.getPressedAt())
            .buzzRank(buzzerPress.getBuzzRank())
            .buzzedAtSeconds(buzzerPress.getBuzzedAtSeconds())
            .gotChanceToAnswer(buzzerPress.getGotChanceToAnswer())
            .answerText(buzzerPress.getAnswerText())
            .answerSubmittedAt(buzzerPress.getAnswerSubmittedAt())
            .isCorrect(buzzerPress.getIsCorrect())
            .pointsAwarded(buzzerPress.getPointsAwarded())
            .build();
    }
}

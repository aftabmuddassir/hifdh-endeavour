package com.hifdh.quest.dto;

import com.hifdh.quest.model.BuzzerPress;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    private Integer pressOrder;
    private Boolean gotChance;
    private String answerText;
    private Boolean isCorrect;

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
            .pressOrder(buzzerPress.getPressOrder())
            .gotChance(buzzerPress.getGotChance())
            .answerText(buzzerPress.getAnswerText())
            .isCorrect(buzzerPress.getIsCorrect())
            .build();
    }
}

package com.hifdh.quest.dto;

import com.hifdh.quest.model.GameParticipant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for game participant data.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParticipantDTO {

    private Long id;
    private String name;
    private Boolean isTeam;
    private Integer totalScore;
    private Integer buzzerPressCount;
    private Boolean isBlocked;

    /**
     * Convert GameParticipant entity to DTO.
     *
     * @param participant GameParticipant entity
     * @return ParticipantDTO
     */
    public static ParticipantDTO fromEntity(GameParticipant participant) {
        if (participant == null) {
            return null;
        }

        return ParticipantDTO.builder()
            .id(participant.getId())
            .name(participant.getName())
            .isTeam(participant.getIsTeam())
            .totalScore(participant.getTotalScore())
            .buzzerPressCount(participant.getBuzzerPressCount())
            .isBlocked(participant.getIsBlocked())
            .build();
    }
}

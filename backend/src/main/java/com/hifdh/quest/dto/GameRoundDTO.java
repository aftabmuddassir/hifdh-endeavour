package com.hifdh.quest.dto;

import com.hifdh.quest.model.GameRound;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for game round data.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameRoundDTO {

    private Long id;
    private Integer roundNumber;
    private Integer surahNumber;
    private Integer ayatNumber;
    private String arabicText;
    private String translation;
    private String audioUrl;
    private String currentQuestionType;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;

    /**
     * Convert GameRound entity to DTO.
     *
     * @param round GameRound entity
     * @return GameRoundDTO
     */
    public static GameRoundDTO fromEntity(GameRound round) {
        if (round == null) {
            return null;
        }

        return GameRoundDTO.builder()
            .id(round.getId())
            .roundNumber(round.getRoundNumber())
            .surahNumber(round.getSurahNumber())
            .ayatNumber(round.getAyatNumber())
            .arabicText(round.getArabicText())
            .translation(round.getTranslation())
            .audioUrl(round.getAudioUrl())
            .currentQuestionType(round.getCurrentQuestionType())
            .startedAt(round.getStartedAt())
            .endedAt(round.getEndedAt())
            .build();
    }
}

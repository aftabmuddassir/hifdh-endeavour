package com.hifdh.quest.dto;

import com.hifdh.quest.model.GameSession;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * DTO for game session data.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameSessionDTO {

    private UUID id;
    private Long adminId;
    private Integer surahRangeStart;
    private Integer surahRangeEnd;
    private Integer juzNumber;
    private String difficulty;
    private Integer timerSeconds;
    private String gameMode;
    private Integer scoreboardLimit;
    private String status;
    private LocalDateTime createdAt;
    private Integer currentRoundNumber;
    private List<ParticipantDTO> participants;
    private List<String> selectedQuestionTypes;
    private Integer currentSurahNumber;
    private Integer currentAyatNumber;
    private List<String> askedQuestionTypes;

    /**
     * Convert GameSession entity to DTO.
     *
     * @param session GameSession entity
     * @return GameSessionDTO
     */
    public static GameSessionDTO fromEntity(GameSession session) {
        if (session == null) {
            return null;
        }

        List<ParticipantDTO> participantDTOs = session.getParticipants().stream()
            .map(ParticipantDTO::fromEntity)
            .collect(Collectors.toList());

        // Convert comma-separated strings to lists
        List<String> selectedQuestionTypes = session.getSelectedQuestionTypes() != null && !session.getSelectedQuestionTypes().isEmpty()
            ? Arrays.asList(session.getSelectedQuestionTypes().split(","))
            : Collections.emptyList();

        List<String> askedQuestionTypes = session.getAskedQuestionTypes() != null && !session.getAskedQuestionTypes().isEmpty()
            ? Arrays.asList(session.getAskedQuestionTypes().split(","))
            : Collections.emptyList();

        return GameSessionDTO.builder()
            .id(session.getId())
            .adminId(session.getAdminId())
            .surahRangeStart(session.getSurahRangeStart())
            .surahRangeEnd(session.getSurahRangeEnd())
            .juzNumber(session.getJuzNumber())
            .difficulty(session.getDifficulty())
            .timerSeconds(session.getTimerSeconds())
            .gameMode(session.getGameMode())
            .scoreboardLimit(session.getScoreboardLimit())
            .status(session.getStatus())
            .createdAt(session.getCreatedAt())
            .currentRoundNumber(session.getRounds().isEmpty() ? 0 : session.getRounds().size())
            .participants(participantDTOs)
            .selectedQuestionTypes(selectedQuestionTypes)
            .currentSurahNumber(session.getCurrentSurahNumber())
            .currentAyatNumber(session.getCurrentAyatNumber())
            .askedQuestionTypes(askedQuestionTypes)
            .build();
    }
}

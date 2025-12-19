package com.hifdh.quest.dto;

import com.hifdh.quest.model.GameSession;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
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
            .build();
    }
}

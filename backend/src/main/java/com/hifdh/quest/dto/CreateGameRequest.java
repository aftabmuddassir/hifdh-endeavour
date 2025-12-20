package com.hifdh.quest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Request DTO for creating a new game session.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateGameRequest {

    private Long adminId;
    private Integer surahRangeStart;
    private Integer surahRangeEnd;
    private Integer juzNumber;
    private String difficulty; // 'easy' (90s), 'medium' (60s), 'hard' (30s)
    private String gameMode; // 'team', 'individual'
    private Integer scoreboardLimit;
    private List<String> participantNames;
    private Long reciterId; // Optional reciter for audio
    private List<String> selectedQuestionTypes; // Question types enabled for this game
}

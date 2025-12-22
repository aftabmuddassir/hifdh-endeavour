package com.hifdh.quest.dto.websocket;

import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.Instant;

/**
 * Event broadcast when a new round starts.
 * Sent to all players when admin clicks "Start Round".
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class RoundStartedEvent extends GameEvent {
    private String roundId;
    private Integer roundNumber;
    private Integer totalRounds; // null if unlimited
    private AyatData ayat;
    private String questionType;
    private String audioUrl;
    private String audioMode;
    private Boolean autoPlayAudio;
    private Integer timerSeconds;
    private Instant timerStartsAt;

    @Builder
    public RoundStartedEvent(String sessionId, String roundId, Integer roundNumber,
                           Integer totalRounds, AyatData ayat, String questionType,
                           String audioUrl, String audioMode, Boolean autoPlayAudio,
                           Integer timerSeconds, Instant timerStartsAt) {
        super("ROUND_STARTED", sessionId);
        this.roundId = roundId;
        this.roundNumber = roundNumber;
        this.totalRounds = totalRounds;
        this.ayat = ayat;
        this.questionType = questionType;
        this.audioUrl = audioUrl;
        this.audioMode = audioMode;
        this.autoPlayAudio = autoPlayAudio;
        this.timerSeconds = timerSeconds;
        this.timerStartsAt = timerStartsAt;
    }

    @Data
    @Builder
    public static class AyatData {
        private Integer surahNumber;
        private Integer ayatNumber;
        private String arabicText;
        private String translationEn;
        private String surahName;
    }
}

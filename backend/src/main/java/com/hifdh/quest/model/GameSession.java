package com.hifdh.quest.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "game_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GameSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "admin_id")
    private Long adminId;

    @Column(name = "surah_range_start", nullable = false)
    private Integer surahRangeStart;

    @Column(name = "surah_range_end", nullable = false)
    private Integer surahRangeEnd;

    @Column(name = "juz_number")
    private Integer juzNumber;

    @Column(name = "difficulty", length = 10)
    private String difficulty; // 'easy', 'medium', 'hard'

    @Column(name = "timer_seconds")
    private Integer timerSeconds;

    @Column(name = "game_mode", length = 20)
    private String gameMode; // 'team', 'individual'

    @Column(name = "scoreboard_limit")
    private Integer scoreboardLimit = 5;

    @Column(name = "status", length = 20)
    private String status; // 'setup', 'active', 'completed'

    @Column(name = "selected_question_types", length = 500)
    private String selectedQuestionTypes; // Comma-separated list of enabled question types

    @Column(name = "current_surah_number")
    private Integer currentSurahNumber;

    @Column(name = "current_ayat_number")
    private Integer currentAyatNumber;

    @Column(name = "asked_question_types", length = 500)
    private String askedQuestionTypes; // Comma-separated list of questions asked for current verse

    // New player game fields from V001 migration
    @Column(name = "audio_mode", length = 20)
    private String audioMode = "ALL_DEVICES"; // 'ALL_DEVICES' or 'HOST_ONLY'

    @Column(name = "round_limit")
    private Integer roundLimit; // NULL = unlimited rounds

    @Column(name = "allow_text_answers")
    private Boolean allowTextAnswers = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GameQuestion> questions = new ArrayList<>();

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GameParticipant> participants = new ArrayList<>();

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GameRound> rounds = new ArrayList<>();
}

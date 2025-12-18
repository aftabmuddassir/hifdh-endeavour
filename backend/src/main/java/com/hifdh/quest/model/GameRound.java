package com.hifdh.quest.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "game_rounds")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GameRound {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private GameSession session;

    @Column(name = "surah_number")
    private Integer surahNumber;

    @Column(name = "ayat_number")
    private Integer ayatNumber;

    @Column(name = "arabic_text", columnDefinition = "TEXT")
    private String arabicText;

    @Column(name = "translation", columnDefinition = "TEXT")
    private String translation;

    @Column(name = "audio_url", length = 512)
    private String audioUrl;

    @Column(name = "round_number")
    private Integer roundNumber;

    @Column(name = "current_question_type", length = 30)
    private String currentQuestionType;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @OneToMany(mappedBy = "round", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BuzzerPress> buzzerPresses = new ArrayList<>();
}

package com.hifdh.quest.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "game_questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GameQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private GameSession session;

    @Column(name = "question_type", length = 30)
    private String questionType; // 'guess_surah', 'guess_meaning', etc.

    @Column(name = "points")
    private Integer points;

    @Column(name = "order_index")
    private Integer orderIndex;
}

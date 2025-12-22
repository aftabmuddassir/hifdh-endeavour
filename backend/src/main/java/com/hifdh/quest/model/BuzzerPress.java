package com.hifdh.quest.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "buzzer_presses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BuzzerPress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "round_id", nullable = false)
    private GameRound round;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participant_id", nullable = false)
    private GameParticipant participant;

    @Column(name = "buzz_rank")
    private Integer buzzRank;

    @Column(name = "press_order", nullable = false)
    private Integer pressOrder;

    @Column(name = "buzzed_at_seconds", precision = 6, scale = 3)
    private BigDecimal buzzedAtSeconds;

    @CreationTimestamp
    @Column(name = "pressed_at", updatable = false)
    private LocalDateTime pressedAt;

    @Column(name = "got_chance_to_answer")
    private Boolean gotChanceToAnswer = false;

    @Column(name = "answer_text", columnDefinition = "TEXT")
    private String answerText;

    @Column(name = "answer_submitted_at")
    private LocalDateTime answerSubmittedAt;

    @Column(name = "is_correct")
    private Boolean isCorrect;

    @Column(name = "points_awarded")
    private Integer pointsAwarded = 0;
}

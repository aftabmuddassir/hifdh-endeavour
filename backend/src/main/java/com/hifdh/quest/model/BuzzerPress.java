package com.hifdh.quest.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

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

    @CreationTimestamp
    @Column(name = "pressed_at", updatable = false)
    private LocalDateTime pressedAt;

    @Column(name = "press_order")
    private Integer pressOrder;

    @Column(name = "got_chance")
    private Boolean gotChance = false;

    @Column(name = "answer_text", columnDefinition = "TEXT")
    private String answerText;

    @Column(name = "is_correct")
    private Boolean isCorrect;
}

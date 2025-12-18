package com.hifdh.quest.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "game_participants")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GameParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private GameSession session;

    @Column(name = "name", length = 100)
    private String name;

    @Column(name = "is_team")
    private Boolean isTeam = false;

    @Column(name = "total_score")
    private Integer totalScore = 0;

    @Column(name = "buzzer_press_count")
    private Integer buzzerPressCount = 0;

    @Column(name = "is_blocked")
    private Boolean isBlocked = false;

    @OneToMany(mappedBy = "participant", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BuzzerPress> buzzerPresses = new ArrayList<>();
}

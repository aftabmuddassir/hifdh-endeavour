package com.hifdh.quest.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

    // New player game fields from V002 migration
    @Column(name = "consecutive_first_buzzes")
    private Integer consecutiveFirstBuzzes = 0;

    @Column(name = "is_blocked_next_round")
    private Boolean isBlockedNextRound = false;

    @Column(name = "buzzed_in_current_round")
    private Boolean buzzedInCurrentRound = false;

    @Column(name = "is_connected")
    private Boolean isConnected = true;

    @Column(name = "last_heartbeat")
    private LocalDateTime lastHeartbeat;

    @OneToMany(mappedBy = "participant", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BuzzerPress> buzzerPresses = new ArrayList<>();
}

package com.hifdh.quest.repository;

import com.hifdh.quest.model.GameRound;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GameRoundRepository extends JpaRepository<GameRound, Long> {

    /**
     * Find all rounds for a specific game session, ordered by round number.
     *
     * @param sessionId Game session ID
     * @return List of rounds
     */
    List<GameRound> findBySessionIdOrderByRoundNumberAsc(UUID sessionId);

    /**
     * Find the current (latest) round for a session.
     *
     * @param sessionId Game session ID
     * @return Optional containing the latest round
     */
    @Query("SELECT r FROM GameRound r WHERE r.session.id = :sessionId ORDER BY r.roundNumber DESC LIMIT 1")
    Optional<GameRound> findLatestRoundBySessionId(UUID sessionId);

    /**
     * Find a specific round by session and round number.
     *
     * @param sessionId Game session ID
     * @param roundNumber Round number
     * @return Optional containing the round
     */
    Optional<GameRound> findBySessionIdAndRoundNumber(UUID sessionId, Integer roundNumber);

    /**
     * Count rounds for a session.
     *
     * @param sessionId Game session ID
     * @return Number of rounds
     */
    long countBySessionId(UUID sessionId);
}

package com.hifdh.quest.repository;

import com.hifdh.quest.model.BuzzerPress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BuzzerPressRepository extends JpaRepository<BuzzerPress, Long> {

    /**
     * Find all buzzer presses for a specific round, ordered by press time.
     *
     * @param roundId Round ID
     * @return List of buzzer presses
     */
    List<BuzzerPress> findByRoundIdOrderByPressedAtAsc(Long roundId);

    /**
     * Find buzzer presses by participant and round.
     *
     * @param participantId Participant ID
     * @param roundId Round ID
     * @return List of buzzer presses
     */
    List<BuzzerPress> findByParticipantIdAndRoundId(Long participantId, Long roundId);

    /**
     * Count buzzer presses for a participant in a specific round.
     *
     * @param participantId Participant ID
     * @param roundId Round ID
     * @return Count of presses
     */
    long countByParticipantIdAndRoundId(Long participantId, Long roundId);

    /**
     * Get the next available buzz rank for a round.
     *
     * @param roundId Round ID
     * @return Next buzz rank number
     */
    @Query("SELECT COALESCE(MAX(bp.buzzRank), 0) + 1 FROM BuzzerPress bp WHERE bp.round.id = :roundId")
    Integer getNextBuzzRank(Long roundId);
}

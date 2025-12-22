package com.hifdh.quest.service;

import com.hifdh.quest.model.GameParticipant;
import com.hifdh.quest.repository.GameParticipantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for tracking consecutive 1st-place buzzes.
 * Blocks players after 3 consecutive 1st-place buzzes to give others a chance.
 */
@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class ConsecutiveBuzzTracker {

    private final GameParticipantRepository participantRepository;

    private static final int MAX_CONSECUTIVE_FIRST_BUZZES = 3;

    /**
     * Record a 1st-place buzz for a participant.
     * Increments consecutive count and blocks if threshold reached.
     *
     * @param participantId Participant ID
     * @return true if participant is now blocked for next round
     */
    public boolean recordFirstPlaceBuzz(Long participantId) {
        GameParticipant participant = participantRepository.findById(participantId)
            .orElseThrow(() -> new IllegalArgumentException("Participant not found: " + participantId));

        // Increment consecutive first buzzes
        int consecutiveCount = participant.getConsecutiveFirstBuzzes() + 1;
        participant.setConsecutiveFirstBuzzes(consecutiveCount);

        log.info("Participant {} has {} consecutive 1st-place buzzes",
            participant.getName(), consecutiveCount);

        // Check if threshold reached
        if (consecutiveCount >= MAX_CONSECUTIVE_FIRST_BUZZES) {
            participant.setIsBlockedNextRound(true);
            participant.setConsecutiveFirstBuzzes(0); // Reset counter

            participantRepository.save(participant);

            log.warn("Participant {} blocked for next round after {} consecutive 1st-place buzzes",
                participant.getName(), MAX_CONSECUTIVE_FIRST_BUZZES);

            return true;
        }

        participantRepository.save(participant);
        return false;
    }

    /**
     * Record a non-1st-place buzz for a participant.
     * Resets their consecutive first buzz counter.
     *
     * @param participantId Participant ID
     */
    public void recordNonFirstPlaceBuzz(Long participantId) {
        GameParticipant participant = participantRepository.findById(participantId)
            .orElseThrow(() -> new IllegalArgumentException("Participant not found: " + participantId));

        if (participant.getConsecutiveFirstBuzzes() > 0) {
            log.info("Participant {} consecutive 1st-place buzzes reset (was {})",
                participant.getName(), participant.getConsecutiveFirstBuzzes());

            participant.setConsecutiveFirstBuzzes(0);
            participantRepository.save(participant);
        }
    }

    /**
     * Update tracking after a buzz is recorded.
     * Call this after saving a buzzer press.
     *
     * @param participantId Participant ID
     * @param buzzRank Buzz rank (1, 2, 3, etc.)
     * @return true if participant is now blocked for next round
     */
    public boolean updateTracking(Long participantId, Integer buzzRank) {
        if (buzzRank == 1) {
            return recordFirstPlaceBuzz(participantId);
        } else {
            recordNonFirstPlaceBuzz(participantId);
            return false;
        }
    }

    /**
     * Reset consecutive buzz counters for all participants in a session.
     * Useful when starting a new game or resetting game state.
     *
     * @param sessionId Session ID (UUID)
     */
    public void resetAllCounters(java.util.UUID sessionId) {
        java.util.List<GameParticipant> participants =
            participantRepository.findBySessionIdOrderByTotalScoreDesc(sessionId);

        for (GameParticipant participant : participants) {
            participant.setConsecutiveFirstBuzzes(0);
            participant.setIsBlockedNextRound(false);
        }

        participantRepository.saveAll(participants);

        log.info("Reset consecutive buzz counters for {} participants in session {}",
            participants.size(), sessionId);
    }

    /**
     * Get the maximum consecutive first buzzes allowed before blocking.
     *
     * @return Max consecutive buzzes
     */
    public int getMaxConsecutiveFirstBuzzes() {
        return MAX_CONSECUTIVE_FIRST_BUZZES;
    }
}

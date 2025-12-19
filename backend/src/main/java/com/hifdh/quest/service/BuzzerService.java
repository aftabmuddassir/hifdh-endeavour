package com.hifdh.quest.service;

import com.hifdh.quest.dto.BuzzerPressDTO;
import com.hifdh.quest.model.BuzzerPress;
import com.hifdh.quest.model.GameParticipant;
import com.hifdh.quest.model.GameRound;
import com.hifdh.quest.repository.BuzzerPressRepository;
import com.hifdh.quest.repository.GameParticipantRepository;
import com.hifdh.quest.repository.GameRoundRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing buzzer presses with anti-spam protection.
 * Implements the "3-press rule" - participants are blocked after 3 buzzer presses.
 */
@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class BuzzerService {

    private final BuzzerPressRepository buzzerPressRepository;
    private final GameParticipantRepository participantRepository;
    private final GameRoundRepository roundRepository;

    private static final int MAX_BUZZER_PRESSES = 3;

    /**
     * Register a buzzer press from a participant.
     * Implements anti-spam: blocks participant after 3 presses.
     *
     * @param roundId Round ID
     * @param participantId Participant ID
     * @return BuzzerPressDTO with press details
     * @throws IllegalStateException if participant is blocked or exceeded press limit
     */
    public BuzzerPressDTO pressBuzzer(Long roundId, Long participantId) {
        GameRound round = roundRepository.findById(roundId)
            .orElseThrow(() -> new IllegalArgumentException("Round not found: " + roundId));

        GameParticipant participant = participantRepository.findById(participantId)
            .orElseThrow(() -> new IllegalArgumentException("Participant not found: " + participantId));

        // Check if participant is blocked
        if (Boolean.TRUE.equals(participant.getIsBlocked())) {
            throw new IllegalStateException("Participant is blocked from buzzing");
        }

        // Check if round has ended
        if (round.getEndedAt() != null) {
            throw new IllegalStateException("Cannot buzz - round has ended");
        }

        // Check buzzer press count for this participant in this round
        long pressCount = buzzerPressRepository.countByParticipantIdAndRoundId(participantId, roundId);

        if (pressCount >= MAX_BUZZER_PRESSES) {
            // Block the participant
            participant.setIsBlocked(true);
            participantRepository.save(participant);

            log.warn("Participant {} exceeded max buzzer presses and has been blocked", participantId);
            throw new IllegalStateException("Maximum buzzer presses exceeded. You are now blocked.");
        }

        // Get next press order
        Integer pressOrder = buzzerPressRepository.getNextPressOrder(roundId);

        // Create buzzer press
        BuzzerPress buzzerPress = new BuzzerPress();
        buzzerPress.setRound(round);
        buzzerPress.setParticipant(participant);
        buzzerPress.setPressOrder(pressOrder);
        buzzerPress.setGotChance(false);

        buzzerPress = buzzerPressRepository.save(buzzerPress);

        // Increment participant's total buzzer press count
        participant.setBuzzerPressCount(participant.getBuzzerPressCount() + 1);
        participantRepository.save(participant);

        log.info("Participant {} pressed buzzer for round {} (order: {}, total presses in round: {})",
            participantId, roundId, pressOrder, pressCount + 1);

        return BuzzerPressDTO.fromEntity(buzzerPress);
    }

    /**
     * Get all buzzer presses for a round, ordered by press time.
     *
     * @param roundId Round ID
     * @return List of BuzzerPressDTO
     */
    @Transactional(readOnly = true)
    public List<BuzzerPressDTO> getBuzzerPressesForRound(Long roundId) {
        List<BuzzerPress> presses = buzzerPressRepository.findByRoundIdOrderByPressedAtAsc(roundId);

        return presses.stream()
            .map(BuzzerPressDTO::fromEntity)
            .collect(Collectors.toList());
    }

    /**
     * Get the next participant in line (lowest press order who hasn't got a chance).
     *
     * @param roundId Round ID
     * @return BuzzerPressDTO or null if no one is waiting
     */
    @Transactional(readOnly = true)
    public BuzzerPressDTO getNextInLine(Long roundId) {
        List<BuzzerPress> presses = buzzerPressRepository.findByRoundIdOrderByPressedAtAsc(roundId);

        return presses.stream()
            .filter(press -> !Boolean.TRUE.equals(press.getGotChance()))
            .findFirst()
            .map(BuzzerPressDTO::fromEntity)
            .orElse(null);
    }

    /**
     * Mark a buzzer press as "got chance" (participant is now answering).
     *
     * @param buzzerPressId Buzzer press ID
     * @return Updated BuzzerPressDTO
     */
    public BuzzerPressDTO markAsGotChance(Long buzzerPressId) {
        BuzzerPress buzzerPress = buzzerPressRepository.findById(buzzerPressId)
            .orElseThrow(() -> new IllegalArgumentException("Buzzer press not found: " + buzzerPressId));

        buzzerPress.setGotChance(true);
        buzzerPress = buzzerPressRepository.save(buzzerPress);

        log.info("Participant {} got chance for round {}",
            buzzerPress.getParticipant().getId(), buzzerPress.getRound().getId());

        return BuzzerPressDTO.fromEntity(buzzerPress);
    }

    /**
     * Record an answer for a buzzer press.
     *
     * @param buzzerPressId Buzzer press ID
     * @param answerText Answer text
     * @param isCorrect Whether the answer is correct
     * @return Updated BuzzerPressDTO
     */
    public BuzzerPressDTO recordAnswer(Long buzzerPressId, String answerText, Boolean isCorrect) {
        BuzzerPress buzzerPress = buzzerPressRepository.findById(buzzerPressId)
            .orElseThrow(() -> new IllegalArgumentException("Buzzer press not found: " + buzzerPressId));

        buzzerPress.setAnswerText(answerText);
        buzzerPress.setIsCorrect(isCorrect);
        buzzerPress = buzzerPressRepository.save(buzzerPress);

        log.info("Recorded answer for buzzer press {} - correct: {}", buzzerPressId, isCorrect);

        return BuzzerPressDTO.fromEntity(buzzerPress);
    }

    /**
     * Reset buzzer state for all participants (new round).
     * This clears the blocked status for all participants.
     *
     * @param sessionId Session ID
     */
    public void resetBuzzersForSession(java.util.UUID sessionId) {
        List<GameParticipant> participants =
            participantRepository.findBySessionIdOrderByTotalScoreDesc(sessionId);

        for (GameParticipant participant : participants) {
            participant.setIsBlocked(false);
        }

        participantRepository.saveAll(participants);

        log.info("Reset buzzer state for session {} ({} participants)", sessionId, participants.size());
    }

    /**
     * Unblock a specific participant (admin action).
     *
     * @param participantId Participant ID
     */
    public void unblockParticipant(Long participantId) {
        GameParticipant participant = participantRepository.findById(participantId)
            .orElseThrow(() -> new IllegalArgumentException("Participant not found: " + participantId));

        participant.setIsBlocked(false);
        participantRepository.save(participant);

        log.info("Unblocked participant {}", participantId);
    }

    /**
     * Block a specific participant (admin action).
     *
     * @param participantId Participant ID
     */
    public void blockParticipant(Long participantId) {
        GameParticipant participant = participantRepository.findById(participantId)
            .orElseThrow(() -> new IllegalArgumentException("Participant not found: " + participantId));

        participant.setIsBlocked(true);
        participantRepository.save(participant);

        log.info("Blocked participant {}", participantId);
    }

    /**
     * Check if a participant can buzz (not blocked, hasn't exceeded limit).
     *
     * @param participantId Participant ID
     * @param roundId Round ID
     * @return true if participant can buzz
     */
    @Transactional(readOnly = true)
    public boolean canParticipantBuzz(Long participantId, Long roundId) {
        GameParticipant participant = participantRepository.findById(participantId)
            .orElseThrow(() -> new IllegalArgumentException("Participant not found: " + participantId));

        if (Boolean.TRUE.equals(participant.getIsBlocked())) {
            return false;
        }

        long pressCount = buzzerPressRepository.countByParticipantIdAndRoundId(participantId, roundId);
        return pressCount < MAX_BUZZER_PRESSES;
    }

    /**
     * Get buzzer press statistics for a participant in a round.
     *
     * @param participantId Participant ID
     * @param roundId Round ID
     * @return Number of presses remaining
     */
    @Transactional(readOnly = true)
    public int getPressesRemaining(Long participantId, Long roundId) {
        long pressCount = buzzerPressRepository.countByParticipantIdAndRoundId(participantId, roundId);
        return Math.max(0, MAX_BUZZER_PRESSES - (int) pressCount);
    }
}

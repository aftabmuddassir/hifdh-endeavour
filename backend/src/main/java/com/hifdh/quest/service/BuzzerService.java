package com.hifdh.quest.service;

import com.hifdh.quest.dto.websocket.BuzzerPressRequest;
import com.hifdh.quest.dto.websocket.BuzzerPressedEvent;
import com.hifdh.quest.dto.websocket.TimerStoppedEvent;
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

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Service for handling buzzer presses during game rounds.
 * Manages buzz ranking, validation, and broadcasting.
 */
@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class BuzzerService {

    private final BuzzerPressRepository buzzerPressRepository;
    private final GameParticipantRepository participantRepository;
    private final GameRoundRepository roundRepository;
    private final GameSessionService gameSessionService;

    // Maximum number of players allowed to buzz per round (configurable)
    private static final int MAX_BUZZES_PER_ROUND = 3;

    /**
     * Handle a buzzer press from a player.
     * Validates the press, assigns rank, saves to database, and broadcasts event.
     *
     * @param request BuzzerPressRequest from player
     * @return BuzzerPressedEvent that was broadcast
     * @throws IllegalStateException if buzzer press is invalid
     */
    public BuzzerPressedEvent handleBuzzerPress(BuzzerPressRequest request) {
        log.info("Processing buzzer press: participant={}, round={}, time={}s",
            request.getParticipantId(), request.getRoundId(), request.getClientElapsedSeconds());

        // Load participant
        GameParticipant participant = participantRepository.findById(request.getParticipantId())
            .orElseThrow(() -> new IllegalArgumentException("Participant not found: " + request.getParticipantId()));

        // Load round
        GameRound round = roundRepository.findById(Long.parseLong(request.getRoundId()))
            .orElseThrow(() -> new IllegalArgumentException("Round not found: " + request.getRoundId()));

        // Validation checks
        validateBuzzerPress(participant, round);

        // Get current buzz count for this round
        long currentBuzzCount = buzzerPressRepository.countByParticipantIdAndRoundId(
            request.getParticipantId(), round.getId());

        // Check if player already buzzed in this round
        if (currentBuzzCount > 0 || participant.getBuzzedInCurrentRound()) {
            throw new IllegalStateException("Player has already buzzed in this round");
        }

        // Get total buzzes for this round
        List<BuzzerPress> roundBuzzes = buzzerPressRepository.findByRoundIdOrderByPressedAtAsc(round.getId());
        int buzzRank = roundBuzzes.size() + 1;

        // Check if max buzzes reached
        if (buzzRank > MAX_BUZZES_PER_ROUND) {
            throw new IllegalStateException("Maximum buzzes reached for this round");
        }

        // Create buzzer press record
        BuzzerPress buzzerPress = new BuzzerPress();
        buzzerPress.setRound(round);
        buzzerPress.setParticipant(participant);
        buzzerPress.setBuzzRank(buzzRank);
        buzzerPress.setPressOrder(buzzRank); // Same as buzz rank for ordering
        buzzerPress.setBuzzedAtSeconds(BigDecimal.valueOf(request.getClientElapsedSeconds()));
        buzzerPress.setPressedAt(Instant.now().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime());
        buzzerPress.setGotChanceToAnswer(buzzRank <= MAX_BUZZES_PER_ROUND);
        buzzerPressRepository.save(buzzerPress);

        // Update participant state
        participant.setBuzzedInCurrentRound(true);
        participant.setBuzzerPressCount(participant.getBuzzerPressCount() + 1);
        participantRepository.save(participant);

        log.info("Buzzer press saved: participant={}, rank={}, time={}s",
            participant.getName(), buzzRank, request.getClientElapsedSeconds());

        // Build and broadcast BUZZER_PRESSED event
        BuzzerPressedEvent event = BuzzerPressedEvent.builder()
            .sessionId(request.getSessionId())
            .participantId(participant.getId())
            .participantName(participant.getName())
            .buzzRank(buzzRank)
            .buzzTimeSeconds(request.getClientElapsedSeconds())
            .totalBuzzesAllowed(MAX_BUZZES_PER_ROUND)
            .remainingSlots(MAX_BUZZES_PER_ROUND - buzzRank)
            .buzzerPressedAt(Instant.now())
            .build();

        gameSessionService.broadcastBuzzerPressed(event);

        // If all slots filled, broadcast TIMER_STOPPED
        if (buzzRank == MAX_BUZZES_PER_ROUND) {
            TimerStoppedEvent timerStoppedEvent = TimerStoppedEvent.builder()
                .sessionId(request.getSessionId())
                .reason("ALL_SLOTS_FILLED")
                .totalBuzzes(MAX_BUZZES_PER_ROUND)
                .build();

            gameSessionService.broadcastTimerStopped(timerStoppedEvent);
            log.info("All buzz slots filled for round {}", round.getId());
        }

        return event;
    }

    /**
     * Validate if a buzzer press is allowed.
     *
     * @param participant GameParticipant
     * @param round GameRound
     * @throws IllegalStateException if press is not allowed
     */
    private void validateBuzzerPress(GameParticipant participant, GameRound round) {
        // Check if participant is blocked for next round
        if (participant.getIsBlockedNextRound()) {
            throw new IllegalStateException("Player is blocked from buzzing this round");
        }

        // Check if round has ended
        if (round.getEndedAt() != null) {
            throw new IllegalStateException("Cannot buzz - round has ended");
        }

        // Check if participant is connected
        if (!participant.getIsConnected()) {
            throw new IllegalStateException("Player is not connected");
        }

        // Check if participant belongs to this session
        if (!round.getSession().getId().equals(participant.getSession().getId())) {
            throw new IllegalStateException("Participant does not belong to this game session");
        }
    }

    /**
     * Reset all participants' buzzed_in_current_round flag for a new round.
     * Called when starting a new round.
     *
     * @param sessionId Game session ID
     */
    public void resetBuzzStateForNewRound(UUID sessionId) {
        List<GameParticipant> participants = participantRepository.findBySessionIdOrderByTotalScoreDesc(sessionId);

        for (GameParticipant participant : participants) {
            participant.setBuzzedInCurrentRound(false);

            // Clear block if player was blocked for this round
            if (participant.getIsBlockedNextRound()) {
                participant.setIsBlockedNextRound(false);
                log.info("Cleared block for participant: {}", participant.getName());
            }
        }

        participantRepository.saveAll(participants);
        log.info("Reset buzz state for {} participants in session {}", participants.size(), sessionId);
    }

    /**
     * Get all buzzer presses for a round, ordered by rank.
     *
     * @param roundId Round ID
     * @return List of BuzzerPress
     */
    @Transactional(readOnly = true)
    public List<BuzzerPress> getRoundBuzzes(Long roundId) {
        return buzzerPressRepository.findByRoundIdOrderByPressedAtAsc(roundId);
    }

    /**
     * Get max buzzes allowed per round.
     *
     * @return Max buzzes count
     */
    public int getMaxBuzzesPerRound() {
        return MAX_BUZZES_PER_ROUND;
    }

    /**
     * Submit a text answer for a buzzer press.
     *
     * @param buzzerPressId Buzzer press ID
     * @param answerText Answer text
     * @return Updated BuzzerPress
     */
    public BuzzerPress submitAnswer(Long buzzerPressId, String answerText) {
        BuzzerPress buzzerPress = buzzerPressRepository.findById(buzzerPressId)
            .orElseThrow(() -> new IllegalArgumentException("Buzzer press not found: " + buzzerPressId));

        buzzerPress.setAnswerText(answerText);
        buzzerPress.setAnswerSubmittedAt(Instant.now().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime());

        buzzerPress = buzzerPressRepository.save(buzzerPress);

        log.info("Answer submitted for buzzer press {}: {}", buzzerPressId, answerText);

        return buzzerPress;
    }

    /**
     * Validate an answer (admin action).
     *
     * @param buzzerPressId Buzzer press ID
     * @param isCorrect Whether the answer is correct
     * @param pointsAwarded Points awarded for this answer
     * @return Updated BuzzerPress
     */
    public BuzzerPress validateAnswer(Long buzzerPressId, Boolean isCorrect, Integer pointsAwarded) {
        BuzzerPress buzzerPress = buzzerPressRepository.findById(buzzerPressId)
            .orElseThrow(() -> new IllegalArgumentException("Buzzer press not found: " + buzzerPressId));

        buzzerPress.setIsCorrect(isCorrect);
        buzzerPress.setPointsAwarded(pointsAwarded != null ? pointsAwarded : 0);

        buzzerPress = buzzerPressRepository.save(buzzerPress);

        log.info("Answer validated for buzzer press {}: correct={}, points={}",
            buzzerPressId, isCorrect, pointsAwarded);

        return buzzerPress;
    }

    // ========================================
    // Legacy/Compatibility Methods for REST API
    // ========================================

    /**
     * Get all buzzer presses for a round (converts to DTO).
     * Legacy method for REST API compatibility.
     *
     * @param roundId Round ID
     * @return List of BuzzerPress entities
     */
    @Transactional(readOnly = true)
    public List<BuzzerPress> getBuzzerPressesForRound(Long roundId) {
        return buzzerPressRepository.findByRoundIdOrderByPressedAtAsc(roundId);
    }

    /**
     * Get next participant in line to answer (legacy method).
     * Returns the buzzer press with lowest rank that hasn't got a chance yet.
     *
     * @param roundId Round ID
     * @return BuzzerPress or null
     */
    @Transactional(readOnly = true)
    public BuzzerPress getNextInLine(Long roundId) {
        List<BuzzerPress> presses = buzzerPressRepository.findByRoundIdOrderByPressedAtAsc(roundId);
        return presses.stream()
            .filter(press -> !press.getGotChanceToAnswer())
            .findFirst()
            .orElse(null);
    }

    /**
     * Mark buzzer press as "got chance to answer" (legacy method).
     *
     * @param buzzerPressId Buzzer press ID
     * @return Updated BuzzerPress
     */
    public BuzzerPress markAsGotChance(Long buzzerPressId) {
        BuzzerPress buzzerPress = buzzerPressRepository.findById(buzzerPressId)
            .orElseThrow(() -> new IllegalArgumentException("Buzzer press not found: " + buzzerPressId));

        buzzerPress.setGotChanceToAnswer(true);
        buzzerPress = buzzerPressRepository.save(buzzerPress);

        log.info("Participant {} got chance for round {}",
            buzzerPress.getParticipant().getId(), buzzerPress.getRound().getId());

        return buzzerPress;
    }

    /**
     * Record answer with validation (legacy method).
     * Combines submitAnswer and validateAnswer.
     *
     * @param buzzerPressId Buzzer press ID
     * @param answerText Answer text
     * @param isCorrect Whether answer is correct
     * @return Updated BuzzerPress
     */
    public BuzzerPress recordAnswer(Long buzzerPressId, String answerText, Boolean isCorrect) {
        BuzzerPress buzzerPress = buzzerPressRepository.findById(buzzerPressId)
            .orElseThrow(() -> new IllegalArgumentException("Buzzer press not found: " + buzzerPressId));

        buzzerPress.setAnswerText(answerText);
        buzzerPress.setIsCorrect(isCorrect);
        buzzerPress.setAnswerSubmittedAt(Instant.now().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime());

        buzzerPress = buzzerPressRepository.save(buzzerPress);

        log.info("Recorded answer for buzzer press {} - correct: {}", buzzerPressId, isCorrect);

        return buzzerPress;
    }

    /**
     * Check if participant can buzz (legacy method).
     *
     * @param participantId Participant ID
     * @param roundId Round ID
     * @return true if can buzz
     */
    @Transactional(readOnly = true)
    public boolean canParticipantBuzz(Long participantId, Long roundId) {
        GameParticipant participant = participantRepository.findById(participantId)
            .orElseThrow(() -> new IllegalArgumentException("Participant not found: " + participantId));

        // Check if blocked for next round
        if (participant.getIsBlockedNextRound()) {
            return false;
        }

        // Check if already buzzed in current round
        if (participant.getBuzzedInCurrentRound()) {
            return false;
        }

        // Check if disconnected
        if (!participant.getIsConnected()) {
            return false;
        }

        return true;
    }

    /**
     * Get remaining buzzes (legacy method).
     * In new system, players can only buzz once per round.
     *
     * @param participantId Participant ID
     * @param roundId Round ID
     * @return 1 if can buzz, 0 if already buzzed
     */
    @Transactional(readOnly = true)
    public int getPressesRemaining(Long participantId, Long roundId) {
        GameParticipant participant = participantRepository.findById(participantId)
            .orElseThrow(() -> new IllegalArgumentException("Participant not found: " + participantId));

        return participant.getBuzzedInCurrentRound() ? 0 : 1;
    }

    /**
     * Unblock a participant (legacy method).
     *
     * @param participantId Participant ID
     */
    public void unblockParticipant(Long participantId) {
        GameParticipant participant = participantRepository.findById(participantId)
            .orElseThrow(() -> new IllegalArgumentException("Participant not found: " + participantId));

        participant.setIsBlockedNextRound(false);
        participantRepository.save(participant);

        log.info("Unblocked participant {}", participantId);
    }

    /**
     * Block a participant (legacy method).
     *
     * @param participantId Participant ID
     */
    public void blockParticipant(Long participantId) {
        GameParticipant participant = participantRepository.findById(participantId)
            .orElseThrow(() -> new IllegalArgumentException("Participant not found: " + participantId));

        participant.setIsBlockedNextRound(true);
        participantRepository.save(participant);

        log.info("Blocked participant {}", participantId);
    }

    /**
     * Reset buzzers for session (legacy method alias).
     *
     * @param sessionId Session ID
     */
    public void resetBuzzersForSession(UUID sessionId) {
        resetBuzzStateForNewRound(sessionId);
    }

    /**
     * Press buzzer (legacy REST API method).
     * Note: New WebSocket-based system uses handleBuzzerPress with BuzzerPressRequest.
     *
     * @param roundId Round ID
     * @param participantId Participant ID
     * @return BuzzerPress entity
     */
    public BuzzerPress pressBuzzer(Long roundId, Long participantId) {
        // This is a simplified version for legacy REST API
        // The new WebSocket system uses handleBuzzerPress instead
        GameParticipant participant = participantRepository.findById(participantId)
            .orElseThrow(() -> new IllegalArgumentException("Participant not found: " + participantId));

        GameRound round = roundRepository.findById(roundId)
            .orElseThrow(() -> new IllegalArgumentException("Round not found: " + roundId));

        // Basic validation
        validateBuzzerPress(participant, round);

        if (participant.getBuzzedInCurrentRound()) {
            throw new IllegalStateException("Player has already buzzed in this round");
        }

        // Get buzz rank
        List<BuzzerPress> roundBuzzes = buzzerPressRepository.findByRoundIdOrderByPressedAtAsc(roundId);
        int buzzRank = roundBuzzes.size() + 1;

        if (buzzRank > MAX_BUZZES_PER_ROUND) {
            throw new IllegalStateException("Maximum buzzes reached for this round");
        }

        // Create buzzer press
        BuzzerPress buzzerPress = new BuzzerPress();
        buzzerPress.setRound(round);
        buzzerPress.setParticipant(participant);
        buzzerPress.setBuzzRank(buzzRank);
        buzzerPress.setPressOrder(buzzRank); // Same as buzz rank for ordering
        buzzerPress.setBuzzedAtSeconds(java.math.BigDecimal.ZERO); // Legacy API doesn't track time
        buzzerPress.setPressedAt(Instant.now().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime());
        buzzerPress.setGotChanceToAnswer(buzzRank <= MAX_BUZZES_PER_ROUND);
        buzzerPressRepository.save(buzzerPress);

        // Update participant state
        participant.setBuzzedInCurrentRound(true);
        participant.setBuzzerPressCount(participant.getBuzzerPressCount() + 1);
        participantRepository.save(participant);

        log.info("Legacy buzzer press: participant={}, rank={}", participant.getName(), buzzRank);

        return buzzerPress;
    }
}

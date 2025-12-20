package com.hifdh.quest.service;

import com.hifdh.quest.dto.CreateGameRequest;
import com.hifdh.quest.dto.GameRoundDTO;
import com.hifdh.quest.dto.GameSessionDTO;
import com.hifdh.quest.dto.ParticipantDTO;
import com.hifdh.quest.model.*;
import com.hifdh.quest.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for managing game sessions, rounds, and participants.
 */
@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class GameSessionService {

    private final GameSessionRepository sessionRepository;
    private final GameParticipantRepository participantRepository;
    private final GameRoundRepository roundRepository;
    private final GameQuestionRepository questionRepository;
    private final AyatRepository ayatRepository;
    private final AyatService ayatService;
    private final SimpMessagingTemplate messagingTemplate;

    // Question types with their points
    private static final Map<String, Integer> QUESTION_POINTS = Map.of(
        "guess_surah", 10,
        "guess_meaning", 15,
        "guess_next_ayat", 20,
        "guess_previous_ayat", 25,
        "guess_reciter", 15
    );

    // Difficulty to timer mapping (in seconds)
    private static final Map<String, Integer> DIFFICULTY_TIMERS = Map.of(
        "easy", 90,
        "medium", 60,
        "hard", 30
    );

    /**
     * Create a new game session with participants.
     *
     * @param request CreateGameRequest with game configuration
     * @return Created GameSessionDTO
     */
    public GameSessionDTO createGameSession(CreateGameRequest request) {
        log.info("Creating new game session with difficulty: {}, mode: {}",
            request.getDifficulty(), request.getGameMode());

        // Validate request
        validateGameRequest(request);

        // Create session
        GameSession session = new GameSession();
        session.setAdminId(request.getAdminId());
        session.setSurahRangeStart(request.getSurahRangeStart());
        session.setSurahRangeEnd(request.getSurahRangeEnd());
        session.setJuzNumber(request.getJuzNumber());
        session.setDifficulty(request.getDifficulty());
        session.setTimerSeconds(DIFFICULTY_TIMERS.get(request.getDifficulty().toLowerCase()));
        session.setGameMode(request.getGameMode());
        session.setScoreboardLimit(request.getScoreboardLimit() != null ? request.getScoreboardLimit() : 5);
        session.setStatus("setup");

        // Store selected question types (default to all if not specified)
        if (request.getSelectedQuestionTypes() != null && !request.getSelectedQuestionTypes().isEmpty()) {
            session.setSelectedQuestionTypes(String.join(",", request.getSelectedQuestionTypes()));
        } else {
            // Default: enable all question types
            session.setSelectedQuestionTypes(String.join(",", QUESTION_POINTS.keySet()));
        }

        // Save session first to get ID
        session = sessionRepository.save(session);

        // Create participants
        if (request.getParticipantNames() != null && !request.getParticipantNames().isEmpty()) {
            for (String name : request.getParticipantNames()) {
                GameParticipant participant = new GameParticipant();
                participant.setSession(session);
                participant.setName(name);
                participant.setIsTeam("team".equalsIgnoreCase(request.getGameMode()));
                participant.setTotalScore(0);
                participant.setBuzzerPressCount(0);
                participant.setIsBlocked(false);
                session.getParticipants().add(participant);
            }
        }

        // Create question types for this session
        int orderIndex = 0;
        for (Map.Entry<String, Integer> entry : QUESTION_POINTS.entrySet()) {
            GameQuestion question = new GameQuestion();
            question.setSession(session);
            question.setQuestionType(entry.getKey());
            question.setPoints(entry.getValue());
            question.setOrderIndex(orderIndex++);
            session.getQuestions().add(question);
        }

        session = sessionRepository.save(session);

        log.info("Created game session {} with {} participants",
            session.getId(), session.getParticipants().size());

        return GameSessionDTO.fromEntity(session);
    }

    /**
     * Start a game session (change status from 'setup' to 'active').
     *
     * @param sessionId Game session ID
     * @return Updated GameSessionDTO
     */
    public GameSessionDTO startGame(UUID sessionId) {
        GameSession session = getSessionOrThrow(sessionId);

        if (!"setup".equals(session.getStatus())) {
            throw new IllegalStateException("Game can only be started from 'setup' status");
        }

        session.setStatus("active");
        session = sessionRepository.save(session);

        log.info("Started game session {}", sessionId);

        GameSessionDTO dto = GameSessionDTO.fromEntity(session);

        // Broadcast game session update via WebSocket
        messagingTemplate.convertAndSend("/topic/game/" + sessionId, dto);

        return dto;
    }

    /**
     * Create a new round for a game session.
     * Uses the single question type selected during game creation for all rounds.
     *
     * @param sessionId Game session ID
     * @param questionType Question type (optional, uses game's selected type if not provided)
     * @param reciterId Optional reciter ID for audio
     * @return Created GameRoundDTO
     */
    public GameRoundDTO createRound(UUID sessionId, String questionType, Long reciterId) {
        GameSession session = getSessionOrThrow(sessionId);

        if (!"active".equals(session.getStatus())) {
            throw new IllegalStateException("Cannot create round when game is not active");
        }

        // Get selected question types for this game
        List<String> selectedQuestionTypes = session.getSelectedQuestionTypes() != null && !session.getSelectedQuestionTypes().isEmpty()
            ? Arrays.asList(session.getSelectedQuestionTypes().split(","))
            : new ArrayList<>(QUESTION_POINTS.keySet());

        if (selectedQuestionTypes.isEmpty()) {
            throw new IllegalStateException("No question types selected for this game");
        }

        // Always select a new ayat for each round (one question per verse)
        Ayat ayat = getNextAyat(session);

        if (ayat == null) {
            throw new IllegalStateException("No available Ayat for round");
        }

        // Use the single selected question type (no random selection needed)
        String nextQuestionType = selectedQuestionTypes.get(0);

        // Update session's current verse
        session.setCurrentSurahNumber(ayat.getSurahNumber());
        session.setCurrentAyatNumber(ayat.getAyatNumber());
        session.setAskedQuestionTypes(nextQuestionType); // Store the single question asked
        session = sessionRepository.save(session);

        // Get next round number
        long roundCount = roundRepository.countBySessionId(sessionId);
        int nextRoundNumber = (int) roundCount + 1;

        // Generate audio URL
        String audioUrl = ayatService.generateAudioUrl(ayat, reciterId);

        // Create round
        GameRound round = new GameRound();
        round.setSession(session);
        round.setRoundNumber(nextRoundNumber);
        round.setSurahNumber(ayat.getSurahNumber());
        round.setSurahNameArabic(ayat.getSurah().getNameArabic());
        round.setSurahNameEnglish(ayat.getSurah().getNameEnglish());
        round.setAyatNumber(ayat.getAyatNumber());
        round.setArabicText(ayat.getArabicText());
        round.setTranslation(ayat.getTranslationEn());
        round.setAudioUrl(audioUrl);
        round.setCurrentQuestionType(nextQuestionType);
        round.setStartedAt(LocalDateTime.now());

        // Fetch previous and next ayahs for navigation (only for guess_next_ayat and guess_previous_ayat)
        if ("guess_next_ayat".equals(nextQuestionType) || "guess_previous_ayat".equals(nextQuestionType)) {
            // Fetch previous ayah
            Ayat previousAyat = getPreviousAyah(ayat);
            if (previousAyat != null) {
                round.setPreviousAyatNumber(previousAyat.getAyatNumber());
                round.setPreviousArabicText(previousAyat.getArabicText());
                round.setPreviousTranslation(previousAyat.getTranslationEn());
            }

            // Fetch next ayah
            Ayat nextAyat = getNextAyah(ayat);
            if (nextAyat != null) {
                round.setNextAyatNumber(nextAyat.getAyatNumber());
                round.setNextArabicText(nextAyat.getArabicText());
                round.setNextTranslation(nextAyat.getTranslationEn());
            }
        }

        round = roundRepository.save(round);

        log.info("Created round {} for session {} with Ayat {}/{} and question type: {}",
            nextRoundNumber, sessionId, ayat.getSurahNumber(), ayat.getAyatNumber(), nextQuestionType);

        return GameRoundDTO.fromEntity(round);
    }

    /**
     * Get the next available ayat for the session.
     *
     * @param session GameSession
     * @return Next Ayat
     */
    private Ayat getNextAyat(GameSession session) {
        // Get used ayat IDs to avoid repetition
        Set<Long> usedAyatIds = session.getRounds().stream()
            .filter(r -> r.getSurahNumber() != null && r.getAyatNumber() != null)
            .map(r -> ayatService.getAyatBySurahAndNumber(r.getSurahNumber(), r.getAyatNumber()))
            .filter(Objects::nonNull)
            .map(Ayat::getId)
            .collect(Collectors.toSet());

        // Select random Ayat based on game configuration
        Ayat ayat;
        if (session.getJuzNumber() != null) {
            ayat = ayatService.getRandomAyatByJuz(session.getJuzNumber(), usedAyatIds);
        } else {
            ayat = ayatService.getRandomAyatBySurahRange(
                session.getSurahRangeStart(),
                session.getSurahRangeEnd(),
                usedAyatIds
            );
        }

        return ayat;
    }

    /**
     * Get the previous ayah (ayah before the given ayah).
     * Returns null if this is the first ayah of the Quran.
     *
     * @param currentAyat Current ayah
     * @return Previous Ayat or null
     */
    private Ayat getPreviousAyah(Ayat currentAyat) {
        Integer currentSurah = currentAyat.getSurahNumber();
        Integer currentAyatNumber = currentAyat.getAyatNumber();

        // Try to get previous ayah in same surah
        if (currentAyatNumber > 1) {
            return ayatRepository.findBySurahAndAyat(currentSurah, currentAyatNumber - 1);
        }

        // First ayah of current surah - get last ayah of previous surah
        if (currentSurah > 1) {
            List<Ayat> previousSurahAyats = ayatRepository.findBySurahNumber(currentSurah - 1);
            if (!previousSurahAyats.isEmpty()) {
                // Return the last ayah of previous surah
                return previousSurahAyats.get(previousSurahAyats.size() - 1);
            }
        }

        // First ayah of Quran (1:1) - no previous
        return null;
    }

    /**
     * Get the next ayah (ayah after the given ayah).
     * Returns null if this is the last ayah of the Quran.
     *
     * @param currentAyat Current ayah
     * @return Next Ayat or null
     */
    private Ayat getNextAyah(Ayat currentAyat) {
        Integer currentSurah = currentAyat.getSurahNumber();
        Integer currentAyatNumber = currentAyat.getAyatNumber();

        // Try to get next ayah in same surah
        Ayat nextInSameSurah = ayatRepository.findBySurahAndAyat(currentSurah, currentAyatNumber + 1);
        if (nextInSameSurah != null) {
            return nextInSameSurah;
        }

        // Last ayah of current surah - get first ayah of next surah
        if (currentSurah < 114) {
            return ayatRepository.findBySurahAndAyat(currentSurah + 1, 1);
        }

        // Last ayah of Quran (114:6) - no next
        return null;
    }

    /**
     * End the current round.
     *
     * @param roundId Round ID
     * @return Updated GameRoundDTO
     */
    public GameRoundDTO endRound(Long roundId) {
        GameRound round = roundRepository.findById(roundId)
            .orElseThrow(() -> new IllegalArgumentException("Round not found: " + roundId));

        if (round.getEndedAt() != null) {
            throw new IllegalStateException("Round already ended");
        }

        round.setEndedAt(LocalDateTime.now());
        round = roundRepository.save(round);

        log.info("Ended round {} for session {}", roundId, round.getSession().getId());

        return GameRoundDTO.fromEntity(round);
    }

    /**
     * Get the current (latest) round for a session.
     *
     * @param sessionId Game session ID
     * @return GameRoundDTO or null if no rounds
     */
    @Transactional(readOnly = true)
    public GameRoundDTO getCurrentRound(UUID sessionId) {
        Optional<GameRound> round = roundRepository.findLatestRoundBySessionId(sessionId);
        return round.map(GameRoundDTO::fromEntity).orElse(null);
    }

    /**
     * Add points to a participant's score.
     *
     * @param participantId Participant ID
     * @param points Points to add
     * @return Updated ParticipantDTO
     */
    public ParticipantDTO addScore(Long participantId, Integer points) {
        GameParticipant participant = participantRepository.findById(participantId)
            .orElseThrow(() -> new IllegalArgumentException("Participant not found: " + participantId));

        participant.setTotalScore(participant.getTotalScore() + points);
        participant = participantRepository.save(participant);

        log.info("Added {} points to participant {} (total: {})",
            points, participantId, participant.getTotalScore());

        return ParticipantDTO.fromEntity(participant);
    }

    /**
     * Get scoreboard for a session (participants ordered by score).
     *
     * @param sessionId Game session ID
     * @return List of ParticipantDTO ordered by score
     */
    @Transactional(readOnly = true)
    public List<ParticipantDTO> getScoreboard(UUID sessionId) {
        List<GameParticipant> participants =
            participantRepository.findBySessionIdOrderByTotalScoreDesc(sessionId);

        return participants.stream()
            .map(ParticipantDTO::fromEntity)
            .collect(Collectors.toList());
    }

    /**
     * End a game session (change status to 'completed').
     *
     * @param sessionId Game session ID
     * @return Updated GameSessionDTO
     */
    public GameSessionDTO endGame(UUID sessionId) {
        GameSession session = getSessionOrThrow(sessionId);

        session.setStatus("completed");
        session = sessionRepository.save(session);

        log.info("Ended game session {}", sessionId);

        return GameSessionDTO.fromEntity(session);
    }

    /**
     * Get a game session by ID.
     *
     * @param sessionId Game session ID
     * @return GameSessionDTO
     */
    @Transactional(readOnly = true)
    public GameSessionDTO getGameSession(UUID sessionId) {
        GameSession session = getSessionOrThrow(sessionId);
        return GameSessionDTO.fromEntity(session);
    }

    /**
     * Get all rounds for a session.
     *
     * @param sessionId Game session ID
     * @return List of GameRoundDTO
     */
    @Transactional(readOnly = true)
    public List<GameRoundDTO> getRounds(UUID sessionId) {
        List<GameRound> rounds = roundRepository.findBySessionIdOrderByRoundNumberAsc(sessionId);

        return rounds.stream()
            .map(GameRoundDTO::fromEntity)
            .collect(Collectors.toList());
    }

    /**
     * Add a participant to an existing game session.
     *
     * @param sessionId Game session ID
     * @param participantName Participant name
     * @return Created ParticipantDTO
     */
    public ParticipantDTO addParticipant(UUID sessionId, String participantName) {
        GameSession session = getSessionOrThrow(sessionId);

        if (!"setup".equals(session.getStatus())) {
            throw new IllegalStateException("Can only add participants during setup");
        }

        GameParticipant participant = new GameParticipant();
        participant.setSession(session);
        participant.setName(participantName);
        participant.setIsTeam("team".equalsIgnoreCase(session.getGameMode()));
        participant.setTotalScore(0);
        participant.setBuzzerPressCount(0);
        participant.setIsBlocked(false);

        participant = participantRepository.save(participant);

        log.info("Added participant {} to session {}", participantName, sessionId);

        // Broadcast updated game session via WebSocket
        GameSessionDTO sessionDTO = GameSessionDTO.fromEntity(session);
        messagingTemplate.convertAndSend("/topic/game/" + sessionId, sessionDTO);

        return ParticipantDTO.fromEntity(participant);
    }

    /**
     * Get points for a specific question type.
     *
     * @param questionType Question type
     * @return Points value
     */
    public Integer getQuestionPoints(String questionType) {
        return QUESTION_POINTS.getOrDefault(questionType, 0);
    }

    // Private helper methods

    private GameSession getSessionOrThrow(UUID sessionId) {
        return sessionRepository.findById(sessionId)
            .orElseThrow(() -> new IllegalArgumentException("Game session not found: " + sessionId));
    }

    private void validateGameRequest(CreateGameRequest request) {
        if (request.getDifficulty() == null ||
            !DIFFICULTY_TIMERS.containsKey(request.getDifficulty().toLowerCase())) {
            throw new IllegalArgumentException("Invalid difficulty. Must be: easy, medium, or hard");
        }

        if (request.getGameMode() == null ||
            (!request.getGameMode().equalsIgnoreCase("team") &&
             !request.getGameMode().equalsIgnoreCase("individual"))) {
            throw new IllegalArgumentException("Invalid game mode. Must be: team or individual");
        }

        // Validate Surah range OR Juz (mutually exclusive)
        boolean hasSurahRange = request.getSurahRangeStart() != null && request.getSurahRangeEnd() != null;
        boolean hasJuz = request.getJuzNumber() != null;

        if (!hasSurahRange && !hasJuz) {
            throw new IllegalArgumentException("Must specify either Surah range or Juz number");
        }

        if (hasSurahRange && hasJuz) {
            throw new IllegalArgumentException("Cannot specify both Surah range and Juz number");
        }

        if (hasSurahRange && !ayatService.isValidSurahRange(request.getSurahRangeStart(), request.getSurahRangeEnd())) {
            throw new IllegalArgumentException("Invalid Surah range");
        }

        if (hasJuz && !ayatService.isValidJuz(request.getJuzNumber())) {
            throw new IllegalArgumentException("Invalid Juz number");
        }
    }
}

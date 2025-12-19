package com.hifdh.quest.controller;

import com.hifdh.quest.dto.*;
import com.hifdh.quest.service.BuzzerService;
import com.hifdh.quest.service.GameSessionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REST API controller for game session management.
 * Handles game creation, rounds, participants, and scoring.
 */
@RestController
@RequestMapping("/api/game")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "${allowed.origins:http://localhost:5173}")
@Tag(name = "Game Management", description = "APIs for managing game sessions, rounds, and participants")
public class GameController {

    private final GameSessionService gameSessionService;
    private final BuzzerService buzzerService;

    /**
     * Create a new game session.
     * POST /api/game/create
     */
    @Operation(
        summary = "Create a new game session",
        description = "Initialize a new game with configuration including difficulty, mode, and participants"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Game session created successfully",
            content = @Content(schema = @Schema(implementation = GameSessionDTO.class))),
        @ApiResponse(responseCode = "400", description = "Invalid request parameters",
            content = @Content)
    })
    @PostMapping("/create")
    public ResponseEntity<GameSessionDTO> createGame(
        @Parameter(description = "Game configuration details")
        @RequestBody CreateGameRequest request) {
        try {
            log.info("Creating new game session");
            GameSessionDTO session = gameSessionService.createGameSession(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(session);
        } catch (IllegalArgumentException e) {
            log.error("Invalid game creation request: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get a game session by ID.
     * GET /api/game/{sessionId}
     */
    @GetMapping("/{sessionId}")
    public ResponseEntity<GameSessionDTO> getGameSession(@PathVariable UUID sessionId) {
        try {
            GameSessionDTO session = gameSessionService.getGameSession(sessionId);
            return ResponseEntity.ok(session);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Start a game session.
     * POST /api/game/{sessionId}/start
     */
    @PostMapping("/{sessionId}/start")
    public ResponseEntity<GameSessionDTO> startGame(@PathVariable UUID sessionId) {
        try {
            GameSessionDTO session = gameSessionService.startGame(sessionId);
            return ResponseEntity.ok(session);
        } catch (IllegalStateException | IllegalArgumentException e) {
            log.error("Cannot start game: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * End a game session.
     * POST /api/game/{sessionId}/end
     */
    @PostMapping("/{sessionId}/end")
    public ResponseEntity<GameSessionDTO> endGame(@PathVariable UUID sessionId) {
        try {
            GameSessionDTO session = gameSessionService.endGame(sessionId);
            return ResponseEntity.ok(session);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Add a participant to a game session.
     * POST /api/game/{sessionId}/participants
     */
    @PostMapping("/{sessionId}/participants")
    public ResponseEntity<ParticipantDTO> addParticipant(
            @PathVariable UUID sessionId,
            @RequestBody Map<String, String> body
    ) {
        try {
            String participantName = body.get("name");
            if (participantName == null || participantName.trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            ParticipantDTO participant = gameSessionService.addParticipant(sessionId, participantName);
            return ResponseEntity.status(HttpStatus.CREATED).body(participant);
        } catch (IllegalStateException | IllegalArgumentException e) {
            log.error("Cannot add participant: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get scoreboard for a game session.
     * GET /api/game/{sessionId}/scoreboard
     */
    @GetMapping("/{sessionId}/scoreboard")
    public ResponseEntity<List<ParticipantDTO>> getScoreboard(@PathVariable UUID sessionId) {
        try {
            List<ParticipantDTO> scoreboard = gameSessionService.getScoreboard(sessionId);
            return ResponseEntity.ok(scoreboard);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Create a new round.
     * POST /api/game/{sessionId}/rounds
     */
    @PostMapping("/{sessionId}/rounds")
    public ResponseEntity<GameRoundDTO> createRound(
            @PathVariable UUID sessionId,
            @RequestBody Map<String, Object> body
    ) {
        try {
            String questionType = (String) body.get("questionType");
            Long reciterId = body.get("reciterId") != null ?
                Long.valueOf(body.get("reciterId").toString()) : null;

            if (questionType == null || questionType.trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            GameRoundDTO round = gameSessionService.createRound(sessionId, questionType, reciterId);

            // Reset buzzers for new round
            buzzerService.resetBuzzersForSession(sessionId);

            return ResponseEntity.status(HttpStatus.CREATED).body(round);
        } catch (IllegalStateException | IllegalArgumentException e) {
            log.error("Cannot create round: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get current round for a session.
     * GET /api/game/{sessionId}/rounds/current
     */
    @GetMapping("/{sessionId}/rounds/current")
    public ResponseEntity<GameRoundDTO> getCurrentRound(@PathVariable UUID sessionId) {
        GameRoundDTO round = gameSessionService.getCurrentRound(sessionId);
        if (round == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(round);
    }

    /**
     * Get all rounds for a session.
     * GET /api/game/{sessionId}/rounds
     */
    @GetMapping("/{sessionId}/rounds")
    public ResponseEntity<List<GameRoundDTO>> getRounds(@PathVariable UUID sessionId) {
        try {
            List<GameRoundDTO> rounds = gameSessionService.getRounds(sessionId);
            return ResponseEntity.ok(rounds);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * End a round.
     * POST /api/game/rounds/{roundId}/end
     */
    @PostMapping("/rounds/{roundId}/end")
    public ResponseEntity<GameRoundDTO> endRound(@PathVariable Long roundId) {
        try {
            GameRoundDTO round = gameSessionService.endRound(roundId);
            return ResponseEntity.ok(round);
        } catch (IllegalStateException | IllegalArgumentException e) {
            log.error("Cannot end round: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Add points to a participant's score.
     * POST /api/game/participants/{participantId}/score
     */
    @PostMapping("/participants/{participantId}/score")
    public ResponseEntity<ParticipantDTO> addScore(
            @PathVariable Long participantId,
            @RequestBody Map<String, Integer> body
    ) {
        try {
            Integer points = body.get("points");
            if (points == null) {
                return ResponseEntity.badRequest().build();
            }

            ParticipantDTO participant = gameSessionService.addScore(participantId, points);
            return ResponseEntity.ok(participant);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get points for a question type.
     * GET /api/game/question-points/{questionType}
     */
    @GetMapping("/question-points/{questionType}")
    public ResponseEntity<Map<String, Integer>> getQuestionPoints(@PathVariable String questionType) {
        Integer points = gameSessionService.getQuestionPoints(questionType);
        return ResponseEntity.ok(Map.of("points", points));
    }

    /**
     * Press buzzer (participant buzzes in).
     * POST /api/game/rounds/{roundId}/buzz
     */
    @PostMapping("/rounds/{roundId}/buzz")
    public ResponseEntity<BuzzerPressDTO> pressBuzzer(
            @PathVariable Long roundId,
            @RequestBody Map<String, Long> body
    ) {
        try {
            Long participantId = body.get("participantId");
            if (participantId == null) {
                return ResponseEntity.badRequest().build();
            }

            BuzzerPressDTO buzzerPress = buzzerService.pressBuzzer(roundId, participantId);
            return ResponseEntity.status(HttpStatus.CREATED).body(buzzerPress);
        } catch (IllegalStateException | IllegalArgumentException e) {
            log.error("Buzzer press failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(null);
        }
    }

    /**
     * Get buzzer presses for a round.
     * GET /api/game/rounds/{roundId}/buzzer-presses
     */
    @GetMapping("/rounds/{roundId}/buzzer-presses")
    public ResponseEntity<List<BuzzerPressDTO>> getBuzzerPresses(@PathVariable Long roundId) {
        List<BuzzerPressDTO> presses = buzzerService.getBuzzerPressesForRound(roundId);
        return ResponseEntity.ok(presses);
    }

    /**
     * Get next participant in buzzer queue.
     * GET /api/game/rounds/{roundId}/next-in-line
     */
    @GetMapping("/rounds/{roundId}/next-in-line")
    public ResponseEntity<BuzzerPressDTO> getNextInLine(@PathVariable Long roundId) {
        BuzzerPressDTO next = buzzerService.getNextInLine(roundId);
        if (next == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(next);
    }

    /**
     * Mark buzzer press as "got chance".
     * POST /api/game/buzzer-presses/{buzzerPressId}/got-chance
     */
    @PostMapping("/buzzer-presses/{buzzerPressId}/got-chance")
    public ResponseEntity<BuzzerPressDTO> markAsGotChance(@PathVariable Long buzzerPressId) {
        try {
            BuzzerPressDTO buzzerPress = buzzerService.markAsGotChance(buzzerPressId);
            return ResponseEntity.ok(buzzerPress);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Record answer for a buzzer press.
     * POST /api/game/buzzer-presses/{buzzerPressId}/answer
     */
    @PostMapping("/buzzer-presses/{buzzerPressId}/answer")
    public ResponseEntity<BuzzerPressDTO> recordAnswer(
            @PathVariable Long buzzerPressId,
            @RequestBody Map<String, Object> body
    ) {
        try {
            String answerText = (String) body.get("answerText");
            Boolean isCorrect = (Boolean) body.get("isCorrect");

            if (isCorrect == null) {
                return ResponseEntity.badRequest().build();
            }

            BuzzerPressDTO buzzerPress = buzzerService.recordAnswer(buzzerPressId, answerText, isCorrect);
            return ResponseEntity.ok(buzzerPress);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Check if participant can buzz.
     * GET /api/game/participants/{participantId}/can-buzz?roundId={roundId}
     */
    @GetMapping("/participants/{participantId}/can-buzz")
    public ResponseEntity<Map<String, Object>> canParticipantBuzz(
            @PathVariable Long participantId,
            @RequestParam Long roundId
    ) {
        try {
            boolean canBuzz = buzzerService.canParticipantBuzz(participantId, roundId);
            int remaining = buzzerService.getPressesRemaining(participantId, roundId);

            return ResponseEntity.ok(Map.of(
                "canBuzz", canBuzz,
                "pressesRemaining", remaining
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Unblock a participant (admin action).
     * POST /api/game/participants/{participantId}/unblock
     */
    @PostMapping("/participants/{participantId}/unblock")
    public ResponseEntity<Void> unblockParticipant(@PathVariable Long participantId) {
        try {
            buzzerService.unblockParticipant(participantId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Block a participant (admin action).
     * POST /api/game/participants/{participantId}/block
     */
    @PostMapping("/participants/{participantId}/block")
    public ResponseEntity<Void> blockParticipant(@PathVariable Long participantId) {
        try {
            buzzerService.blockParticipant(participantId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

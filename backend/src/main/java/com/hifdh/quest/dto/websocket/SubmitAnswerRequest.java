package com.hifdh.quest.dto.websocket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Request sent from player when submitting their answer.
 * Only sent if allow_text_answers is true.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitAnswerRequest {
    private String sessionId;
    private Long participantId;
    private String roundId;
    private String answerText;
    private Instant submittedAt;
}

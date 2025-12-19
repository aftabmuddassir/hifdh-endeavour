package com.hifdh.quest.repository;

import com.hifdh.quest.model.GameQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GameQuestionRepository extends JpaRepository<GameQuestion, Long> {

    /**
     * Find all questions for a specific game session, ordered by index.
     *
     * @param sessionId Game session ID
     * @return List of questions
     */
    List<GameQuestion> findBySessionIdOrderByOrderIndexAsc(UUID sessionId);

    /**
     * Find questions by type for a session.
     *
     * @param sessionId Game session ID
     * @param questionType Question type
     * @return List of questions
     */
    List<GameQuestion> findBySessionIdAndQuestionType(UUID sessionId, String questionType);
}

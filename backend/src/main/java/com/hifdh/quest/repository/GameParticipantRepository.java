package com.hifdh.quest.repository;

import com.hifdh.quest.model.GameParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GameParticipantRepository extends JpaRepository<GameParticipant, Long> {

    List<GameParticipant> findBySessionIdOrderByTotalScoreDesc(UUID sessionId);
}

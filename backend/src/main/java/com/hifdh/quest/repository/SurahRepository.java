package com.hifdh.quest.repository;

import com.hifdh.quest.model.Surah;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SurahRepository extends JpaRepository<Surah, Integer> {
}

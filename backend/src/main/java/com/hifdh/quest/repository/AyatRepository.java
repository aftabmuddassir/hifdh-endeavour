package com.hifdh.quest.repository;

import com.hifdh.quest.model.Ayat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface AyatRepository extends JpaRepository<Ayat, Long> {

    List<Ayat> findBySurahNumberBetweenAndIdNotIn(
        Integer surahStart,
        Integer surahEnd,
        Set<Long> usedAyatIds
    );

    List<Ayat> findByJuzNumberAndIdNotIn(
        Integer juzNumber,
        Set<Long> usedAyatIds
    );

    List<Ayat> findBySurahNumber(Integer surahNumber);

    @Query("SELECT a FROM Ayat a WHERE a.surahNumber = :surahNumber AND a.ayatNumber = :ayatNumber")
    Ayat findBySurahAndAyat(Integer surahNumber, Integer ayatNumber);
}

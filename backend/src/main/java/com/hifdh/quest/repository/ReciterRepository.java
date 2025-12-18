package com.hifdh.quest.repository;

import com.hifdh.quest.model.Reciter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReciterRepository extends JpaRepository<Reciter, Long> {

    /**
     * Find a reciter by their EveryAyah code.
     *
     * @param everyayahCode The unique EveryAyah code (e.g., "Alafasy_64kbps")
     * @return Optional containing the Reciter if found
     */
    Optional<Reciter> findByEveryayahCode(String everyayahCode);

    /**
     * Find reciters by country.
     *
     * @param country Country name
     * @return List of reciters from that country
     */
    java.util.List<Reciter> findByCountry(String country);
}

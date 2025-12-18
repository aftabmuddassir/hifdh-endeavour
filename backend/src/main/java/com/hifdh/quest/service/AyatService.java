package com.hifdh.quest.service;

import com.hifdh.quest.model.Ayat;
import com.hifdh.quest.model.Reciter;
import com.hifdh.quest.repository.AyatRepository;
import com.hifdh.quest.repository.ReciterRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Service for managing Quran verses (Ayat) selection and audio generation.
 * Implements random selection logic for game questions.
 */
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
@Slf4j
public class AyatService {

    private final AyatRepository ayatRepository;
    private final ReciterRepository reciterRepository;
    private final Random random = new Random();

    /**
     * Get a random Ayat from specified Surah range, excluding previously used ones.
     *
     * @param surahStart Starting Surah number (1-114)
     * @param surahEnd Ending Surah number (1-114)
     * @param usedAyatIds Set of Ayat IDs to exclude
     * @return Random Ayat or null if none available
     */
    public Ayat getRandomAyatBySurahRange(Integer surahStart, Integer surahEnd, Set<Long> usedAyatIds) {
        if (usedAyatIds == null) {
            usedAyatIds = Collections.emptySet();
        }

        List<Ayat> availableAyat = ayatRepository.findBySurahNumberBetweenAndIdNotIn(
            surahStart, surahEnd, usedAyatIds
        );

        if (availableAyat.isEmpty()) {
            log.warn("No available Ayat in range {}-{} excluding {} used verses",
                surahStart, surahEnd, usedAyatIds.size());
            return null;
        }

        int randomIndex = random.nextInt(availableAyat.size());
        Ayat selectedAyat = availableAyat.get(randomIndex);

        log.debug("Selected Ayat {}/{} from range {}-{}",
            selectedAyat.getSurahNumber(), selectedAyat.getAyatNumber(), surahStart, surahEnd);

        return selectedAyat;
    }

    /**
     * Get a random Ayat from specified Juz, excluding previously used ones.
     *
     * @param juzNumber Juz number (1-30)
     * @param usedAyatIds Set of Ayat IDs to exclude
     * @return Random Ayat or null if none available
     */
    public Ayat getRandomAyatByJuz(Integer juzNumber, Set<Long> usedAyatIds) {
        if (usedAyatIds == null) {
            usedAyatIds = Collections.emptySet();
        }

        List<Ayat> availableAyat = ayatRepository.findByJuzNumberAndIdNotIn(juzNumber, usedAyatIds);

        if (availableAyat.isEmpty()) {
            log.warn("No available Ayat in Juz {} excluding {} used verses",
                juzNumber, usedAyatIds.size());
            return null;
        }

        int randomIndex = random.nextInt(availableAyat.size());
        Ayat selectedAyat = availableAyat.get(randomIndex);

        log.debug("Selected Ayat {}/{} from Juz {}",
            selectedAyat.getSurahNumber(), selectedAyat.getAyatNumber(), juzNumber);

        return selectedAyat;
    }

    /**
     * Get the next Ayat in sequence.
     * Handles boundary cases (end of Surah, end of Quran).
     *
     * @param currentAyat Current Ayat
     * @return Next Ayat or null if at end of Quran
     */
    public Ayat getNextAyat(Ayat currentAyat) {
        if (currentAyat == null) {
            return null;
        }

        Integer currentSurah = currentAyat.getSurahNumber();
        Integer currentAyatNum = currentAyat.getAyatNumber();

        // Try to get next ayat in same surah
        Ayat nextInSurah = ayatRepository.findBySurahAndAyat(currentSurah, currentAyatNum + 1);

        if (nextInSurah != null) {
            return nextInSurah;
        }

        // End of surah reached - move to next surah
        if (currentSurah < 114) {
            // Get first ayat of next surah
            Ayat firstOfNextSurah = ayatRepository.findBySurahAndAyat(currentSurah + 1, 1);

            if (firstOfNextSurah != null) {
                return firstOfNextSurah;
            }
        }

        log.debug("No next Ayat found for {}/{}", currentSurah, currentAyatNum);
        return null; // End of Quran
    }

    /**
     * Get the previous Ayat in sequence.
     * Handles boundary cases (start of Surah, start of Quran).
     *
     * @param currentAyat Current Ayat
     * @return Previous Ayat or null if at start of Quran
     */
    public Ayat getPreviousAyat(Ayat currentAyat) {
        if (currentAyat == null) {
            return null;
        }

        Integer currentSurah = currentAyat.getSurahNumber();
        Integer currentAyatNum = currentAyat.getAyatNumber();

        // If not the first ayat of surah, get previous in same surah
        if (currentAyatNum > 1) {
            return ayatRepository.findBySurahAndAyat(currentSurah, currentAyatNum - 1);
        }

        // First ayat of surah - move to previous surah's last ayat
        if (currentSurah > 1) {
            List<Ayat> previousSurahAyat = ayatRepository.findBySurahNumber(currentSurah - 1);

            if (!previousSurahAyat.isEmpty()) {
                // Return the last ayat of previous surah
                return previousSurahAyat.get(previousSurahAyat.size() - 1);
            }
        }

        log.debug("No previous Ayat found for {}/{}", currentSurah, currentAyatNum);
        return null; // Start of Quran
    }

    /**
     * Generate EveryAyah.com audio URL for an Ayat.
     * Format: http://everyayah.com/data/{reciterCode}/{SSS}{AAA}.mp3
     * Example: http://everyayah.com/data/Alafasy_64kbps/001001.mp3
     *
     * @param ayat The Ayat to generate URL for
     * @param reciterId ID of the reciter
     * @return Audio URL string
     */
    public String generateAudioUrl(Ayat ayat, Long reciterId) {
        if (ayat == null) {
            return null;
        }

        String reciterCode = "Alafasy_64kbps"; // Default reciter

        if (reciterId != null) {
            Optional<Reciter> reciter = reciterRepository.findById(reciterId);
            if (reciter.isPresent()) {
                reciterCode = reciter.get().getEveryayahCode();
            }
        }

        // Format: SSS = 3-digit surah, AAA = 3-digit ayat
        String surahPadded = String.format("%03d", ayat.getSurahNumber());
        String ayatPadded = String.format("%03d", ayat.getAyatNumber());

        String audioUrl = String.format(
            "https://everyayah.com/data/%s/%s%s.mp3",
            reciterCode, surahPadded, ayatPadded
        );

        log.debug("Generated audio URL: {}", audioUrl);
        return audioUrl;
    }

    /**
     * Get Ayat by ID.
     *
     * @param ayatId Ayat ID
     * @return Ayat or null if not found
     */
    public Ayat getAyatById(Long ayatId) {
        return ayatRepository.findById(ayatId).orElse(null);
    }

    /**
     * Get all Ayat for a specific Surah.
     *
     * @param surahNumber Surah number (1-114)
     * @return List of Ayat in the Surah
     */
    public List<Ayat> getAyatBySurah(Integer surahNumber) {
        return ayatRepository.findBySurahNumber(surahNumber);
    }

    /**
     * Get a specific Ayat by Surah and Ayat number.
     *
     * @param surahNumber Surah number (1-114)
     * @param ayatNumber Ayat number
     * @return Ayat or null if not found
     */
    public Ayat getAyatBySurahAndNumber(Integer surahNumber, Integer ayatNumber) {
        return ayatRepository.findBySurahAndAyat(surahNumber, ayatNumber);
    }

    /**
     * Validate if Surah range is valid.
     *
     * @param surahStart Starting Surah (1-114)
     * @param surahEnd Ending Surah (1-114)
     * @return true if valid range
     */
    public boolean isValidSurahRange(Integer surahStart, Integer surahEnd) {
        return surahStart != null && surahEnd != null &&
               surahStart >= 1 && surahStart <= 114 &&
               surahEnd >= 1 && surahEnd <= 114 &&
               surahStart <= surahEnd;
    }

    /**
     * Validate if Juz number is valid.
     *
     * @param juzNumber Juz number (1-30)
     * @return true if valid
     */
    public boolean isValidJuz(Integer juzNumber) {
        return juzNumber != null && juzNumber >= 1 && juzNumber <= 30;
    }
}

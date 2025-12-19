package com.hifdh.quest.controller;

import com.hifdh.quest.dto.AyatDTO;
import com.hifdh.quest.model.Ayat;
import com.hifdh.quest.service.AyatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * REST API controller for Ayat operations.
 * Provides endpoints for retrieving Quran verses.
 */
@RestController
@RequestMapping("/api/ayat")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "${allowed.origins:http://localhost:5173}")
@Tag(name = "Quran Ayat", description = "APIs for retrieving Quran verses with audio URLs")
public class AyatController {

    private final AyatService ayatService;

    /**
     * Get a random Ayat from specified Surah range.
     * GET /api/ayat/random?surahStart=1&surahEnd=114&reciterId=1
     */
    @GetMapping("/random")
    public ResponseEntity<AyatDTO> getRandomAyat(
            @RequestParam(required = false, defaultValue = "1") Integer surahStart,
            @RequestParam(required = false, defaultValue = "114") Integer surahEnd,
            @RequestParam(required = false) Long reciterId
    ) {
        log.info("Getting random Ayat from Surah {}-{}", surahStart, surahEnd);

        if (!ayatService.isValidSurahRange(surahStart, surahEnd)) {
            return ResponseEntity.badRequest().build();
        }

        Ayat ayat = ayatService.getRandomAyatBySurahRange(surahStart, surahEnd, Collections.emptySet());

        if (ayat == null) {
            return ResponseEntity.notFound().build();
        }

        String audioUrl = ayatService.generateAudioUrl(ayat, reciterId);
        AyatDTO dto = AyatDTO.fromEntityWithAudio(ayat, audioUrl);

        return ResponseEntity.ok(dto);
    }

    /**
     * Get a random Ayat from specified Juz.
     * GET /api/ayat/random/juz?juzNumber=30&reciterId=1
     */
    @GetMapping("/random/juz")
    public ResponseEntity<AyatDTO> getRandomAyatByJuz(
            @RequestParam Integer juzNumber,
            @RequestParam(required = false) Long reciterId
    ) {
        log.info("Getting random Ayat from Juz {}", juzNumber);

        if (!ayatService.isValidJuz(juzNumber)) {
            return ResponseEntity.badRequest().build();
        }

        Ayat ayat = ayatService.getRandomAyatByJuz(juzNumber, Collections.emptySet());

        if (ayat == null) {
            return ResponseEntity.notFound().build();
        }

        String audioUrl = ayatService.generateAudioUrl(ayat, reciterId);
        AyatDTO dto = AyatDTO.fromEntityWithAudio(ayat, audioUrl);

        return ResponseEntity.ok(dto);
    }

    /**
     * Get a specific Ayat by ID.
     * GET /api/ayat/123?reciterId=1
     */
    @GetMapping("/{ayatId}")
    public ResponseEntity<AyatDTO> getAyatById(
            @PathVariable Long ayatId,
            @RequestParam(required = false) Long reciterId
    ) {
        Ayat ayat = ayatService.getAyatById(ayatId);

        if (ayat == null) {
            return ResponseEntity.notFound().build();
        }

        String audioUrl = ayatService.generateAudioUrl(ayat, reciterId);
        AyatDTO dto = AyatDTO.fromEntityWithAudio(ayat, audioUrl);

        return ResponseEntity.ok(dto);
    }

    /**
     * Get the next Ayat in sequence.
     * GET /api/ayat/123/next?reciterId=1
     */
    @GetMapping("/{ayatId}/next")
    public ResponseEntity<AyatDTO> getNextAyat(
            @PathVariable Long ayatId,
            @RequestParam(required = false) Long reciterId
    ) {
        Ayat currentAyat = ayatService.getAyatById(ayatId);

        if (currentAyat == null) {
            return ResponseEntity.notFound().build();
        }

        Ayat nextAyat = ayatService.getNextAyat(currentAyat);

        if (nextAyat == null) {
            return ResponseEntity.notFound().build();
        }

        String audioUrl = ayatService.generateAudioUrl(nextAyat, reciterId);
        AyatDTO dto = AyatDTO.fromEntityWithAudio(nextAyat, audioUrl);

        return ResponseEntity.ok(dto);
    }

    /**
     * Get the previous Ayat in sequence.
     * GET /api/ayat/123/previous?reciterId=1
     */
    @GetMapping("/{ayatId}/previous")
    public ResponseEntity<AyatDTO> getPreviousAyat(
            @PathVariable Long ayatId,
            @RequestParam(required = false) Long reciterId
    ) {
        Ayat currentAyat = ayatService.getAyatById(ayatId);

        if (currentAyat == null) {
            return ResponseEntity.notFound().build();
        }

        Ayat previousAyat = ayatService.getPreviousAyat(currentAyat);

        if (previousAyat == null) {
            return ResponseEntity.notFound().build();
        }

        String audioUrl = ayatService.generateAudioUrl(previousAyat, reciterId);
        AyatDTO dto = AyatDTO.fromEntityWithAudio(previousAyat, audioUrl);

        return ResponseEntity.ok(dto);
    }

    /**
     * Get all Ayat for a specific Surah.
     * GET /api/ayat/surah/1
     */
    @GetMapping("/surah/{surahNumber}")
    public ResponseEntity<List<AyatDTO>> getAyatBySurah(
            @PathVariable Integer surahNumber,
            @RequestParam(required = false) Long reciterId
    ) {
        if (surahNumber < 1 || surahNumber > 114) {
            return ResponseEntity.badRequest().build();
        }

        List<Ayat> ayatList = ayatService.getAyatBySurah(surahNumber);

        List<AyatDTO> dtoList = ayatList.stream()
            .map(ayat -> {
                String audioUrl = ayatService.generateAudioUrl(ayat, reciterId);
                return AyatDTO.fromEntityWithAudio(ayat, audioUrl);
            })
            .collect(Collectors.toList());

        return ResponseEntity.ok(dtoList);
    }

    /**
     * Get a specific Ayat by Surah and Ayat number.
     * GET /api/ayat/surah/1/ayat/1?reciterId=1
     */
    @GetMapping("/surah/{surahNumber}/ayat/{ayatNumber}")
    public ResponseEntity<AyatDTO> getAyatBySurahAndNumber(
            @PathVariable Integer surahNumber,
            @PathVariable Integer ayatNumber,
            @RequestParam(required = false) Long reciterId
    ) {
        Ayat ayat = ayatService.getAyatBySurahAndNumber(surahNumber, ayatNumber);

        if (ayat == null) {
            return ResponseEntity.notFound().build();
        }

        String audioUrl = ayatService.generateAudioUrl(ayat, reciterId);
        AyatDTO dto = AyatDTO.fromEntityWithAudio(ayat, audioUrl);

        return ResponseEntity.ok(dto);
    }
}

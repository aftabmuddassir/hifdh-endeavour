package com.hifdh.quest.controller;

import com.hifdh.quest.model.Reciter;
import com.hifdh.quest.repository.ReciterRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST API controller for Reciter operations.
 * Provides endpoints for retrieving Quran reciters.
 */
@RestController
@RequestMapping("/api/reciters")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "${allowed.origins:http://localhost:5173}")
@Tag(name = "Quran Reciters", description = "APIs for retrieving information about Quran reciters")
public class ReciterController {

    private final ReciterRepository reciterRepository;

    /**
     * Get all reciters.
     * GET /api/reciters
     */
    @GetMapping
    public ResponseEntity<List<Reciter>> getAllReciters() {
        List<Reciter> reciters = reciterRepository.findAll();
        return ResponseEntity.ok(reciters);
    }

    /**
     * Get a reciter by ID.
     * GET /api/reciters/{reciterId}
     */
    @GetMapping("/{reciterId}")
    public ResponseEntity<Reciter> getReciterById(@PathVariable Long reciterId) {
        return reciterRepository.findById(reciterId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get a reciter by EveryAyah code.
     * GET /api/reciters/code/{everyayahCode}
     */
    @GetMapping("/code/{everyayahCode}")
    public ResponseEntity<Reciter> getReciterByCode(@PathVariable String everyayahCode) {
        return reciterRepository.findByEveryayahCode(everyayahCode)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get reciters by country.
     * GET /api/reciters/country/{country}
     */
    @GetMapping("/country/{country}")
    public ResponseEntity<List<Reciter>> getRecitersByCountry(@PathVariable String country) {
        List<Reciter> reciters = reciterRepository.findByCountry(country);
        return ResponseEntity.ok(reciters);
    }
}

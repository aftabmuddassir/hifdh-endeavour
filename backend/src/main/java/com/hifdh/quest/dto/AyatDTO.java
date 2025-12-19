package com.hifdh.quest.dto;

import com.hifdh.quest.model.Ayat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for Ayat with additional metadata.
 * Used to send Ayat data to the frontend with audio URLs.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AyatDTO {

    private Long id;
    private Integer surahNumber;
    private String surahNameArabic;
    private String surahNameEnglish;
    private Integer ayatNumber;
    private String arabicText;
    private String translationEn;
    private Integer juzNumber;
    private String audioUrl;

    /**
     * Create AyatDTO from Ayat entity.
     *
     * @param ayat Ayat entity
     * @return AyatDTO
     */
    public static AyatDTO fromEntity(Ayat ayat) {
        if (ayat == null) {
            return null;
        }

        AyatDTOBuilder builder = AyatDTO.builder()
            .id(ayat.getId())
            .surahNumber(ayat.getSurahNumber())
            .ayatNumber(ayat.getAyatNumber())
            .arabicText(ayat.getArabicText())
            .translationEn(ayat.getTranslationEn())
            .juzNumber(ayat.getJuzNumber());

        // Add Surah details if available
        if (ayat.getSurah() != null) {
            builder
                .surahNameArabic(ayat.getSurah().getNameArabic())
                .surahNameEnglish(ayat.getSurah().getNameEnglish());
        }

        return builder.build();
    }

    /**
     * Create AyatDTO from Ayat entity with audio URL.
     *
     * @param ayat Ayat entity
     * @param audioUrl Generated audio URL
     * @return AyatDTO
     */
    public static AyatDTO fromEntityWithAudio(Ayat ayat, String audioUrl) {
        AyatDTO dto = fromEntity(ayat);
        if (dto != null) {
            dto.setAudioUrl(audioUrl);
        }
        return dto;
    }
}

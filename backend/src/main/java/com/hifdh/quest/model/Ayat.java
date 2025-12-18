package com.hifdh.quest.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ayat", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"surah_number", "ayat_number"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ayat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "surah_number", nullable = false)
    private Integer surahNumber;

    @Column(name = "ayat_number", nullable = false)
    private Integer ayatNumber;

    @Column(name = "arabic_text", nullable = false, columnDefinition = "TEXT")
    private String arabicText;

    @Column(name = "translation_en", columnDefinition = "TEXT")
    private String translationEn;

    @Column(name = "juz_number")
    private Integer juzNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "surah_number", insertable = false, updatable = false)
    private Surah surah;
}

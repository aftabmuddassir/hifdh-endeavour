package com.hifdh.quest.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "surahs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Surah {

    @Id
    @Column(name = "surah_number")
    private Integer surahNumber;

    @Column(name = "name_arabic", nullable = false, length = 100)
    private String nameArabic;

    @Column(name = "name_english", nullable = false, length = 100)
    private String nameEnglish;

    @Column(name = "total_ayat", nullable = false)
    private Integer totalAyat;

    @Column(name = "revelation_place", length = 20)
    private String revelationPlace;
}

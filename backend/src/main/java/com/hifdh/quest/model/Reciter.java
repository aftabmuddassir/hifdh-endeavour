package com.hifdh.quest.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "reciters")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Reciter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", length = 100)
    private String name;

    @Column(name = "everyayah_code", length = 50)
    private String everyayahCode;

    @Column(name = "country", length = 50)
    private String country;
}

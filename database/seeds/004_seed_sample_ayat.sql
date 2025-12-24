-- ============================================
-- SAMPLE AYAT DATA FOR TESTING
-- ============================================
-- This file contains sample ayat from various surahs for testing purposes
-- For production, you need to import all 6,236 ayat from a complete Quran database

-- Al-Fatiha (Surah 1) - Complete surah (7 ayat)
INSERT INTO ayat (surah_number, ayat_number, arabic_text, translation_en, juz_number) VALUES
(1, 1, 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', 'In the name of Allah, the Entirely Merciful, the Especially Merciful.', 1),
(1, 2, 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', 'All praise is due to Allah, Lord of the worlds.', 1),
(1, 3, 'الرَّحْمَٰنِ الرَّحِيمِ', 'The Entirely Merciful, the Especially Merciful,', 1),
(1, 4, 'مَالِكِ يَوْمِ الدِّينِ', 'Sovereign of the Day of Recompense.', 1),
(1, 5, 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', 'It is You we worship and You we ask for help.', 1),
(1, 6, 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', 'Guide us to the straight path.', 1),
(1, 7, 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ', 'The path of those upon whom You have bestowed favor, not of those who have evoked Your anger or of those who are astray.', 1);

-- Al-Ikhlas (Surah 112) - Complete surah (4 ayat)
INSERT INTO ayat (surah_number, ayat_number, arabic_text, translation_en, juz_number) VALUES
(112, 1, 'قُلْ هُوَ اللَّهُ أَحَدٌ', 'Say, He is Allah, the One.', 30),
(112, 2, 'اللَّهُ الصَّمَدُ', 'Allah, the Eternal Refuge.', 30),
(112, 3, 'لَمْ يَلِدْ وَلَمْ يُولَدْ', 'He neither begets nor is born,', 30),
(112, 4, 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ', 'Nor is there to Him any equivalent.', 30);

-- Al-Falaq (Surah 113) - Complete surah (5 ayat)
INSERT INTO ayat (surah_number, ayat_number, arabic_text, translation_en, juz_number) VALUES
(113, 1, 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ', 'Say, I seek refuge in the Lord of daybreak', 30),
(113, 2, 'مِن شَرِّ مَا خَلَقَ', 'From the evil of that which He created', 30),
(113, 3, 'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ', 'And from the evil of darkness when it settles', 30),
(113, 4, 'وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ', 'And from the evil of the blowers in knots', 30),
(113, 5, 'وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ', 'And from the evil of an envier when he envies.', 30);

-- An-Nas (Surah 114) - Complete surah (6 ayat)
INSERT INTO ayat (surah_number, ayat_number, arabic_text, translation_en, juz_number) VALUES
(114, 1, 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ', 'Say, I seek refuge in the Lord of mankind,', 30),
(114, 2, 'مَلِكِ النَّاسِ', 'The Sovereign of mankind.', 30),
(114, 3, 'إِلَٰهِ النَّاسِ', 'The God of mankind,', 30),
(114, 4, 'مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ', 'From the evil of the retreating whisperer -', 30),
(114, 5, 'الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ', 'Who whispers evil in the breasts of mankind -', 30),
(114, 6, 'مِنَ الْجِنَّةِ وَالنَّاسِ', 'From among the jinn and mankind.', 30);

-- Al-Fajr (Surah 89) - First 5 ayat for testing
INSERT INTO ayat (surah_number, ayat_number, arabic_text, translation_en, juz_number) VALUES
(89, 1, 'وَالْفَجْرِ', 'By the dawn', 30),
(89, 2, 'وَلَيَالٍ عَشْرٍ', 'And by the ten nights', 30),
(89, 3, 'وَالشَّفْعِ وَالْوَتْرِ', 'And by the even and the odd', 30),
(89, 4, 'وَاللَّيْلِ إِذَا يَسْرِ', 'And by the night when it passes', 30),
(89, 5, 'هَلْ فِي ذَٰلِكَ قَسَمٌ لِّذِي حِجْرٍ', 'Is there not in that an oath for one of perception?', 30);

-- Al-Balad (Surah 90) - First 5 ayat for testing
INSERT INTO ayat (surah_number, ayat_number, arabic_text, translation_en, juz_number) VALUES
(90, 1, 'لَا أُقْسِمُ بِهَٰذَا الْبَلَدِ', 'I swear by this city, Makkah', 30),
(90, 2, 'وَأَنتَ حِلٌّ بِهَٰذَا الْبَلَدِ', 'And you, O Muhammad, are free of restriction in this city', 30),
(90, 3, 'وَوَالِدٍ وَمَا وَلَدَ', 'And by the father and that which was born of him', 30),
(90, 4, 'لَقَدْ خَلَقْنَا الْإِنسَانَ فِي كَبَدٍ', 'We have certainly created man into hardship.', 30),
(90, 5, 'أَيَحْسَبُ أَن لَّن يَقْدِرَ عَلَيْهِ أَحَدٌ', 'Does he think that never will anyone overcome him?', 30);

-- Update surah total_ayat counts for accuracy
-- (Already set in the surahs seed file, but including here for reference)

-- Seed data for reciters
-- These codes match EveryAyah.com directory structure

INSERT INTO reciters (name, everyayah_code, country) VALUES
('Mishary Rashid Alafasy', 'Alafasy_128kbps', 'Kuwait'),
('Abdul Basit Abdus Samad', 'Abdul_Basit_Murattal_192kbps', 'Egypt'),
('Mahmoud Khalil Al-Hussary', 'Husary_128kbps', 'Egypt'),
('Saad Al-Ghamadi', 'Ghamadi_40kbps', 'Saudi Arabia'),
('Ali Abdur-Rahman Al-Huthaify', 'Hudhaify_128kbps', 'Saudi Arabia'),
('Abdullah Matroud', 'Abdullah_Matroud_128kbps', 'Saudi Arabia'),
('Ahmed ibn Ali al-Ajamy', 'ahmed_ibn_ali_al_ajamy_128kbps', 'Saudi Arabia'),
('Yasser Ad-Dussary', 'Yasser_Ad-Dussary_128kbps', 'Saudi Arabia');

-- Verify count
SELECT COUNT(*) as total_reciters FROM reciters;

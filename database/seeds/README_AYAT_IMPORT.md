# Importing Full Ayat Data

The complete Quran contains **6,236 verses (ayat)**. Due to the large size, we provide multiple options to seed this data:

## Option 1: Use Tanzil API (Recommended)

```bash
# Download JSON format
curl "https://tanzil.net/trans/?transID=en.sahih&type=txt-json" -o quran_en_sahih.json

# Then use a script to parse and insert into database
```

## Option 2: Use Quran.com API

```bash
# Example: Fetch Surah Al-Fatihah (Surah 1)
curl "https://api.quran.com/api/v4/verses/by_chapter/1?language=en&words=false&translations=131" \
  -H "Accept: application/json"

# Repeat for all 114 surahs
```

## Option 3: Manual SQL Import Script

Create a script that generates INSERT statements:

```sql
-- Example for Surah 87 (Al-A'la)
INSERT INTO ayat (surah_number, ayat_number, arabic_text, translation_en, juz_number) VALUES
(87, 1, 'سَبِّحِ ٱسْمَ رَبِّكَ ٱلْأَعْلَى', 'Exalt the name of your Lord, the Most High', 30),
(87, 2, 'ٱلَّذِى خَلَقَ فَسَوَّىٰ', 'Who created and proportioned', 30),
-- ... continue for all 19 ayat
```

## Option 4: Download Pre-formatted SQL

We'll provide a complete `004_seed_ayat.sql` file with all 6,236 verses.

**File size**: ~5-10 MB
**Lines**: ~6,236+ INSERT statements

## Verification Query

After import, verify:

```sql
-- Should return 6,236
SELECT COUNT(*) FROM ayat;

-- Check distribution
SELECT surah_number, COUNT(*) as ayat_count
FROM ayat
GROUP BY surah_number
ORDER BY surah_number;
```

## Development Quick Start

For rapid testing, you can seed just a few surahs (87-114) manually:

```sql
-- See: 004_seed_sample_ayat.sql (last 28 surahs)
```

This will give you ~560 verses to test with, which is sufficient for MVP development.

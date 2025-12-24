-- Hifdh Quest Database Schema
-- Version: 1.0.0
-- Description: Complete schema for gamified Quran memorization platform

-- Drop tables if they exist (for clean reinstall)
DROP TABLE IF EXISTS buzzer_presses CASCADE;
DROP TABLE IF EXISTS game_rounds CASCADE;
DROP TABLE IF EXISTS game_questions CASCADE;
DROP TABLE IF EXISTS game_participants CASCADE;
DROP TABLE IF EXISTS game_sessions CASCADE;
DROP TABLE IF EXISTS reciters CASCADE;
DROP TABLE IF EXISTS ayat CASCADE;
DROP TABLE IF EXISTS surahs CASCADE;

-- ============================================
-- SURAH METADATA TABLE
-- ============================================
CREATE TABLE surahs (
    surah_number INT PRIMARY KEY CHECK (surah_number BETWEEN 1 AND 114),
    name_arabic VARCHAR(100) NOT NULL,
    name_english VARCHAR(100) NOT NULL,
    total_ayat INT NOT NULL,
    revelation_place VARCHAR(20)
);

COMMENT ON TABLE surahs IS 'Metadata for all 114 Surahs of the Quran';
COMMENT ON COLUMN surahs.revelation_place IS 'Meccan or Medinan';

-- ============================================
-- AYAT (VERSES) TABLE
-- ============================================
CREATE TABLE ayat (
    id BIGSERIAL PRIMARY KEY,
    surah_number INT NOT NULL REFERENCES surahs(surah_number),
    ayat_number INT NOT NULL,
    arabic_text TEXT NOT NULL,
    translation_en TEXT,
    juz_number INT CHECK (juz_number BETWEEN 1 AND 30),
    UNIQUE(surah_number, ayat_number)
);

COMMENT ON TABLE ayat IS 'All 6,236 verses of the Quran';
CREATE INDEX idx_ayat_surah ON ayat(surah_number);
CREATE INDEX idx_ayat_juz ON ayat(juz_number);

-- ============================================
-- RECITERS TABLE
-- ============================================
CREATE TABLE reciters (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    everyayah_code VARCHAR(50) NOT NULL UNIQUE,
    country VARCHAR(50)
);

COMMENT ON TABLE reciters IS 'Available Quran reciters for audio playback';

-- ============================================
-- GAME SESSIONS TABLE
-- ============================================
CREATE TABLE game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id BIGINT,
    surah_range_start INT NOT NULL CHECK (surah_range_start BETWEEN 1 AND 114),
    surah_range_end INT NOT NULL CHECK (surah_range_end BETWEEN 1 AND 114),
    juz_number INT CHECK (juz_number BETWEEN 1 AND 30),
    difficulty VARCHAR(10) CHECK (difficulty IN ('easy', 'medium', 'hard')),
    timer_seconds INT NOT NULL,
    game_mode VARCHAR(20) CHECK (game_mode IN ('team', 'individual')),
    scoreboard_limit INT DEFAULT 5,
    status VARCHAR(20) DEFAULT 'setup' CHECK (status IN ('setup', 'active', 'completed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_surah_range CHECK (surah_range_start <= surah_range_end)
);

COMMENT ON TABLE game_sessions IS 'Main game session configurations';
CREATE INDEX idx_game_sessions_status ON game_sessions(status);

-- ============================================
-- GAME QUESTIONS TABLE
-- ============================================
CREATE TABLE game_questions (
    id BIGSERIAL PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    question_type VARCHAR(30) NOT NULL CHECK (question_type IN (
        'guess_surah',
        'guess_meaning',
        'guess_next_ayat',
        'guess_previous_ayat',
        'guess_reciter'
    )),
    points INT NOT NULL,
    order_index INT NOT NULL
);

COMMENT ON TABLE game_questions IS 'Selected question types for each game session';
CREATE INDEX idx_game_questions_session ON game_questions(session_id);

-- ============================================
-- GAME PARTICIPANTS TABLE
-- ============================================
CREATE TABLE game_participants (
    id BIGSERIAL PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    is_team BOOLEAN DEFAULT false,
    total_score INT DEFAULT 0,
    buzzer_press_count INT DEFAULT 0 CHECK (buzzer_press_count >= 0),
    is_blocked BOOLEAN DEFAULT false
);

COMMENT ON TABLE game_participants IS 'Players or teams in a game session';
COMMENT ON COLUMN game_participants.buzzer_press_count IS 'Tracks consecutive buzzer presses for anti-spam';
CREATE INDEX idx_participants_session ON game_participants(session_id);
CREATE INDEX idx_participants_score ON game_participants(total_score DESC);

-- ============================================
-- GAME ROUNDS TABLE
-- ============================================
CREATE TABLE game_rounds (
    id BIGSERIAL PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    surah_number INT NOT NULL,
    ayat_number INT NOT NULL,
    arabic_text TEXT NOT NULL,
    translation TEXT,
    audio_url VARCHAR(512),
    round_number INT NOT NULL,
    current_question_type VARCHAR(30),
    started_at TIMESTAMP,
    ended_at TIMESTAMP
);

COMMENT ON TABLE game_rounds IS 'Each round with a specific ayat and question';
CREATE INDEX idx_rounds_session ON game_rounds(session_id);
CREATE INDEX idx_rounds_number ON game_rounds(round_number);

-- ============================================
-- BUZZER PRESSES TABLE
-- ============================================
CREATE TABLE buzzer_presses (
    id BIGSERIAL PRIMARY KEY,
    round_id BIGINT NOT NULL REFERENCES game_rounds(id) ON DELETE CASCADE,
    participant_id BIGINT NOT NULL REFERENCES game_participants(id) ON DELETE CASCADE,
    pressed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    press_order INT NOT NULL,
    got_chance BOOLEAN DEFAULT false,
    answer_text TEXT,
    is_correct BOOLEAN
);

COMMENT ON TABLE buzzer_presses IS 'Tracks all buzzer presses during gameplay';
CREATE INDEX idx_buzzer_round ON buzzer_presses(round_id);
CREATE INDEX idx_buzzer_participant ON buzzer_presses(participant_id);
CREATE INDEX idx_buzzer_order ON buzzer_presses(press_order);

-- ============================================
-- VIEWS FOR ANALYTICS
-- ============================================

-- Real-time scoreboard view
CREATE OR REPLACE VIEW v_scoreboard AS
SELECT
    gp.session_id,
    gp.id as participant_id,
    gp.name,
    gp.is_team,
    gp.total_score,
    ROW_NUMBER() OVER (PARTITION BY gp.session_id ORDER BY gp.total_score DESC) as rank
FROM game_participants gp
ORDER BY gp.session_id, gp.total_score DESC;

COMMENT ON VIEW v_scoreboard IS 'Real-time ranked scoreboard for each game session';

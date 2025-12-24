-- Initial Schema for Hifdh Quest
-- Creates all base tables required by the application

-- Surahs table
CREATE TABLE IF NOT EXISTS surahs (
    surah_number INTEGER PRIMARY KEY,
    name_arabic VARCHAR(100) NOT NULL,
    name_english VARCHAR(100) NOT NULL,
    total_ayat INTEGER NOT NULL,
    revelation_place VARCHAR(20)
);

-- Ayat table
CREATE TABLE IF NOT EXISTS ayat (
    id BIGSERIAL PRIMARY KEY,
    surah_number INTEGER NOT NULL,
    ayat_number INTEGER NOT NULL,
    arabic_text TEXT NOT NULL,
    translation_en TEXT,
    juz_number INTEGER,
    CONSTRAINT uk_ayat_surah_ayat UNIQUE (surah_number, ayat_number)
);

-- Reciters table
CREATE TABLE IF NOT EXISTS reciters (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100),
    everyayah_code VARCHAR(50),
    country VARCHAR(50)
);

-- Game Sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
    id UUID PRIMARY KEY,
    admin_id BIGINT,
    surah_range_start INTEGER NOT NULL,
    surah_range_end INTEGER NOT NULL,
    juz_number INTEGER,
    difficulty VARCHAR(10),
    timer_seconds INTEGER,
    game_mode VARCHAR(20),
    scoreboard_limit INTEGER DEFAULT 5,
    status VARCHAR(20),
    selected_question_types VARCHAR(500),
    current_surah_number INTEGER,
    current_ayat_number INTEGER,
    asked_question_types VARCHAR(500),
    audio_mode VARCHAR(20) DEFAULT 'ALL_DEVICES',
    round_limit INTEGER,
    allow_text_answers BOOLEAN DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Game Participants table
CREATE TABLE IF NOT EXISTS game_participants (
    id BIGSERIAL PRIMARY KEY,
    session_id UUID NOT NULL,
    name VARCHAR(100),
    is_team BOOLEAN DEFAULT false,
    total_score INTEGER DEFAULT 0,
    buzzer_press_count INTEGER DEFAULT 0,
    is_blocked BOOLEAN DEFAULT false,
    consecutive_first_buzzes INTEGER DEFAULT 0,
    consecutive_correct_answers INTEGER DEFAULT 0,
    is_blocked_next_round BOOLEAN DEFAULT false,
    buzzed_in_current_round BOOLEAN DEFAULT false,
    is_connected BOOLEAN DEFAULT true,
    last_heartbeat TIMESTAMP,
    CONSTRAINT fk_participant_session FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE CASCADE
);

-- Game Rounds table
CREATE TABLE IF NOT EXISTS game_rounds (
    id BIGSERIAL PRIMARY KEY,
    session_id UUID NOT NULL,
    surah_number INTEGER,
    surah_name_arabic VARCHAR(100),
    surah_name_english VARCHAR(100),
    ayat_number INTEGER,
    arabic_text TEXT,
    translation TEXT,
    audio_url VARCHAR(512),
    previous_ayat_number INTEGER,
    previous_arabic_text TEXT,
    previous_translation TEXT,
    next_ayat_number INTEGER,
    next_arabic_text TEXT,
    next_translation TEXT,
    round_number INTEGER,
    current_question_type VARCHAR(30),
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    CONSTRAINT fk_round_session FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE CASCADE
);

-- Buzzer Presses table
CREATE TABLE IF NOT EXISTS buzzer_presses (
    id BIGSERIAL PRIMARY KEY,
    round_id BIGINT NOT NULL,
    participant_id BIGINT NOT NULL,
    buzz_rank INTEGER,
    press_order INTEGER NOT NULL,
    buzzed_at_seconds DECIMAL(6, 3),
    pressed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    got_chance_to_answer BOOLEAN DEFAULT false,
    answer_text TEXT,
    answer_submitted_at TIMESTAMP,
    is_correct BOOLEAN,
    points_awarded INTEGER DEFAULT 0,
    CONSTRAINT fk_buzzer_round FOREIGN KEY (round_id) REFERENCES game_rounds(id) ON DELETE CASCADE,
    CONSTRAINT fk_buzzer_participant FOREIGN KEY (participant_id) REFERENCES game_participants(id) ON DELETE CASCADE
);

-- Game Questions table
CREATE TABLE IF NOT EXISTS game_questions (
    id BIGSERIAL PRIMARY KEY,
    session_id UUID NOT NULL,
    question_type VARCHAR(30),
    points INTEGER,
    order_index INTEGER,
    CONSTRAINT fk_question_session FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE CASCADE
);

-- Scoring Events table (for detailed analytics)
CREATE TABLE IF NOT EXISTS scoring_events (
    id BIGSERIAL PRIMARY KEY,
    round_id BIGINT,
    participant_id BIGINT,
    base_points INTEGER NOT NULL,
    time_multiplier DECIMAL(3,2) DEFAULT 1.0,
    time_bonus_points INTEGER DEFAULT 0,
    buzz_rank_bonus INTEGER DEFAULT 0,
    bonus_points INTEGER DEFAULT 0,
    total_points INTEGER NOT NULL,
    buzz_time_seconds DECIMAL(6,3),
    buzz_rank INTEGER,
    is_correct BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_scoring_round FOREIGN KEY (round_id) REFERENCES game_rounds(id) ON DELETE CASCADE,
    CONSTRAINT fk_scoring_participant FOREIGN KEY (participant_id) REFERENCES game_participants(id) ON DELETE CASCADE
);

-- Bonus Awards table (for admin-awarded bonuses)
CREATE TABLE IF NOT EXISTS bonus_awards (
    id BIGSERIAL PRIMARY KEY,
    session_id UUID,
    participant_id BIGINT,
    admin_name VARCHAR(255),
    bonus_points INTEGER NOT NULL,
    reason TEXT,
    awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bonus_session FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_bonus_participant FOREIGN KEY (participant_id) REFERENCES game_participants(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ayat_surah ON ayat(surah_number);
CREATE INDEX IF NOT EXISTS idx_ayat_juz ON ayat(juz_number);
CREATE INDEX IF NOT EXISTS idx_participant_session ON game_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_round_session ON game_rounds(session_id);
CREATE INDEX IF NOT EXISTS idx_buzzer_round ON buzzer_presses(round_id);
CREATE INDEX IF NOT EXISTS idx_buzzer_participant ON buzzer_presses(participant_id);
CREATE INDEX IF NOT EXISTS idx_question_session ON game_questions(session_id);
CREATE INDEX IF NOT EXISTS idx_scoring_round ON scoring_events(round_id);
CREATE INDEX IF NOT EXISTS idx_scoring_participant ON scoring_events(participant_id);
CREATE INDEX IF NOT EXISTS idx_bonus_session ON bonus_awards(session_id);
CREATE INDEX IF NOT EXISTS idx_bonus_participant ON bonus_awards(participant_id);

-- Comments for documentation
COMMENT ON TABLE ayat IS 'Stores Quranic verses with Arabic text and translations';
COMMENT ON TABLE surahs IS 'Stores Surah metadata';
COMMENT ON TABLE reciters IS 'Stores reciter information for audio playback';
COMMENT ON TABLE game_sessions IS 'Stores game session configuration and state';
COMMENT ON TABLE game_participants IS 'Stores player/team information for each game session';
COMMENT ON TABLE game_rounds IS 'Stores individual rounds/questions within a game session';
COMMENT ON TABLE buzzer_presses IS 'Tracks buzzer presses and answers for each round';
COMMENT ON TABLE game_questions IS 'Stores question configuration for game sessions';
COMMENT ON TABLE scoring_events IS 'Detailed breakdown of points awarded for each answer';
COMMENT ON TABLE bonus_awards IS 'Admin-awarded bonus points to participants during or after the game';

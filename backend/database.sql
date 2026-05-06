-- Foydalanuvchilar jadvali
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(200) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vazifalar jadvali
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  day_of_week INTEGER NOT NULL,
  week_start VARCHAR(20) NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Odatlar jadvali
CREATE TABLE habits (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(20) DEFAULT '#22c55e',
  priority INTEGER DEFAULT 5,
  goal_days INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Odatlar bajarilganligini qayd etish (Logs)
CREATE TABLE habit_logs (
  id SERIAL PRIMARY KEY,
  habit_id INTEGER REFERENCES habits(id) ON DELETE CASCADE,
  log_date VARCHAR(20) NOT NULL,
  is_done BOOLEAN DEFAULT true,
  UNIQUE(habit_id, log_date)
);

-- Chellenjlar jadvali
CREATE TABLE challenges (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  duration_days INTEGER NOT NULL,
  quantity_label VARCHAR(100),
  status VARCHAR(50) DEFAULT 'not_started',
  start_date VARCHAR(20),
  end_date VARCHAR(20)
);

-- Chellenj loglari
CREATE TABLE challenge_logs (
  id SERIAL PRIMARY KEY,
  challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE,
  log_date VARCHAR(20) NOT NULL,
  is_done BOOLEAN DEFAULT true,
  UNIQUE(challenge_id, log_date)
);
-- Eslatmalar jadvali
CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

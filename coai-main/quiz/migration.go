package quiz

// 数据库迁移SQL

const CreateQuizTablesSQL = `
-- 题目集表
CREATE TABLE IF NOT EXISTS quiz_sets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    topic VARCHAR(100),
    difficulty VARCHAR(20) NOT NULL,
    question_num INTEGER NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_topic (topic),
    INDEX idx_created_at (created_at)
);

-- 题目表
CREATE TABLE IF NOT EXISTS quiz_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_set_id INTEGER NOT NULL,
    question TEXT NOT NULL,
    description TEXT,
    options TEXT NOT NULL,
    answer VARCHAR(10) NOT NULL,
    resources TEXT,
    created_at DATETIME NOT NULL,
    INDEX idx_quiz_set_id (quiz_set_id),
    FOREIGN KEY (quiz_set_id) REFERENCES quiz_sets(id) ON DELETE CASCADE
);

-- 答题记录表
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    quiz_set_id INTEGER NOT NULL,
    score FLOAT NOT NULL,
    answers TEXT NOT NULL,
    time_spent INTEGER,
    created_at DATETIME NOT NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_quiz_set_id (quiz_set_id),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_set_id) REFERENCES quiz_sets(id) ON DELETE CASCADE
);
`

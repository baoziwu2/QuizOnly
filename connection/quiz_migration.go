package connection

import (
	"chat/globals"
	"database/sql"
)

// MigrateQuizTables 执行 quiz 相关表的迁移
func MigrateQuizTables(db *sql.DB) error {
	// 检查表是否已存在
	var tableName string
	err := db.QueryRow("SELECT name FROM sqlite_master WHERE type='table' AND name='quiz_sets'").Scan(&tableName)

	if err == sql.ErrNoRows {
		// 表不存在，执行创建
		globals.Warn("Creating quiz tables...")

		// 创建 quiz_sets 表
		_, err := db.Exec(`
			CREATE TABLE IF NOT EXISTS quiz_sets (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				user_id INTEGER NOT NULL,
				title VARCHAR(255) NOT NULL,
				description TEXT,
				topic VARCHAR(100),
				difficulty VARCHAR(20) NOT NULL,
				question_num INTEGER NOT NULL,
				created_at DATETIME NOT NULL,
				updated_at DATETIME NOT NULL
			)
		`)
		if err != nil {
			return err
		}

		// 创建 quiz_questions 表
		_, err = db.Exec(`
			CREATE TABLE IF NOT EXISTS quiz_questions (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				quiz_set_id INTEGER NOT NULL,
				question TEXT NOT NULL,
				description TEXT,
				options TEXT NOT NULL,
				answer VARCHAR(10) NOT NULL,
				resources TEXT,
				created_at DATETIME NOT NULL,
				FOREIGN KEY (quiz_set_id) REFERENCES quiz_sets(id) ON DELETE CASCADE
			)
		`)
		if err != nil {
			return err
		}

		// 创建 quiz_attempts 表
		_, err = db.Exec(`
			CREATE TABLE IF NOT EXISTS quiz_attempts (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				user_id INTEGER NOT NULL,
				quiz_set_id INTEGER NOT NULL,
				score FLOAT NOT NULL,
				answers TEXT NOT NULL,
				time_spent INTEGER,
				created_at DATETIME NOT NULL,
				FOREIGN KEY (quiz_set_id) REFERENCES quiz_sets(id) ON DELETE CASCADE
			)
		`)
		if err != nil {
			return err
		}

		// 创建索引
		indexes := []string{
			"CREATE INDEX IF NOT EXISTS idx_quiz_sets_user_id ON quiz_sets(user_id)",
			"CREATE INDEX IF NOT EXISTS idx_quiz_sets_topic ON quiz_sets(topic)",
			"CREATE INDEX IF NOT EXISTS idx_quiz_sets_created_at ON quiz_sets(created_at)",
			"CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_set_id ON quiz_questions(quiz_set_id)",
			"CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id)",
			"CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_set_id ON quiz_attempts(quiz_set_id)",
			"CREATE INDEX IF NOT EXISTS idx_quiz_attempts_created_at ON quiz_attempts(created_at)",
		}

		for _, index := range indexes {
			_, err := db.Exec(index)
			if err != nil {
				globals.Warn("Failed to create index: %s", err.Error())
			}
		}

		globals.Info("Quiz tables created successfully")
	} else if err != nil {
		return err
	} else {
		globals.Info("Quiz tables already exist")
	}

	return nil
}

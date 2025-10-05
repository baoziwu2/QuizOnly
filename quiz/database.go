package quiz

import (
	"chat/globals"
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
)

// SaveQuizSet 保存题目集和题目
func SaveQuizSet(c *gin.Context, quizSet *QuizSet, questions []QuizQuestion) (int64, error) {
	db := globals.GetDB(c)
	if db == nil {
		return 0, fmt.Errorf("database connection not found")
	}

	tx, err := db.Begin()
	if err != nil {
		return 0, err
	}
	defer tx.Rollback()

	// 插入题目集
	result, err := tx.Exec(`
		INSERT INTO quiz_sets (user_id, title, description, topic, difficulty, question_num, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`, quizSet.UserID, quizSet.Title, quizSet.Description, quizSet.Topic, quizSet.Difficulty, quizSet.QuestionNum, quizSet.CreatedAt, quizSet.UpdatedAt)

	if err != nil {
		return 0, err
	}

	quizSetID, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	// 插入题目
	for _, q := range questions {
		optionsJSON, _ := json.Marshal(q.Options)
		resourcesJSON, _ := json.Marshal(q.Resources)

		_, err := tx.Exec(`
			INSERT INTO quiz_questions (quiz_set_id, question, description, options, answer, resources, created_at)
			VALUES (?, ?, ?, ?, ?, ?, ?)
		`, quizSetID, q.Question, q.Description, optionsJSON, q.Answer, resourcesJSON, time.Now())

		if err != nil {
			return 0, err
		}
	}

	if err := tx.Commit(); err != nil {
		return 0, err
	}

	return quizSetID, nil
}

// GetQuizSetsByUser 获取用户的题目集列表
func GetQuizSetsByUser(c *gin.Context, userID int64, req *ListQuizSetsRequest) ([]QuizSet, int64, error) {
	db := globals.GetDB(c)
	if db == nil {
		return nil, 0, fmt.Errorf("database connection not found")
	}

	// 构建查询条件
	where := "WHERE user_id = ?"
	args := []interface{}{userID}

	if req.Topic != "" {
		where += " AND topic LIKE ?"
		args = append(args, "%"+req.Topic+"%")
	}

	// 获取总数
	var total int64
	err := db.QueryRow("SELECT COUNT(*) FROM quiz_sets "+where, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// 获取列表
	offset := (req.Page - 1) * req.PageSize
	args = append(args, req.PageSize, offset)

	rows, err := db.Query(`
		SELECT id, user_id, title, description, topic, difficulty, question_num, created_at, updated_at
		FROM quiz_sets `+where+`
		ORDER BY created_at DESC
		LIMIT ? OFFSET ?
	`, args...)

	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var quizSets []QuizSet
	for rows.Next() {
		var qs QuizSet
		err := rows.Scan(&qs.ID, &qs.UserID, &qs.Title, &qs.Description, &qs.Topic, &qs.Difficulty, &qs.QuestionNum, &qs.CreatedAt, &qs.UpdatedAt)
		if err != nil {
			return nil, 0, err
		}
		quizSets = append(quizSets, qs)
	}

	return quizSets, total, nil
}

// GetQuizSetByID 根据ID获取题目集
func GetQuizSetByID(c *gin.Context, id, userID int64) (*QuizSet, error) {
	db := globals.GetDB(c)
	if db == nil {
		return nil, fmt.Errorf("database connection not found")
	}

	var qs QuizSet
	err := db.QueryRow(`
		SELECT id, user_id, title, description, topic, difficulty, question_num, created_at, updated_at
		FROM quiz_sets
		WHERE id = ? AND user_id = ?
	`, id, userID).Scan(&qs.ID, &qs.UserID, &qs.Title, &qs.Description, &qs.Topic, &qs.Difficulty, &qs.QuestionNum, &qs.CreatedAt, &qs.UpdatedAt)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("quiz set not found")
	}
	if err != nil {
		return nil, err
	}

	return &qs, nil
}

// DeleteQuizSet 删除题目集
func DeleteQuizSet(c *gin.Context, id, userID int64) error {
	db := globals.GetDB(c)
	if db == nil {
		return fmt.Errorf("database connection not found")
	}

	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// 删除题目
	_, err = tx.Exec("DELETE FROM quiz_questions WHERE quiz_set_id = ?", id)
	if err != nil {
		return err
	}

	// 删除题目集
	result, err := tx.Exec("DELETE FROM quiz_sets WHERE id = ? AND user_id = ?", id, userID)
	if err != nil {
		return err
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if affected == 0 {
		return fmt.Errorf("quiz set not found")
	}

	return tx.Commit()
}

// GetQuestionsByQuizSetID 获取题目集的所有题目
func GetQuestionsByQuizSetID(c *gin.Context, quizSetID int64) ([]QuizQuestion, error) {
	db := globals.GetDB(c)
	if db == nil {
		return nil, fmt.Errorf("database connection not found")
	}

	rows, err := db.Query(`
		SELECT id, quiz_set_id, question, description, options, answer, resources, created_at
		FROM quiz_questions
		WHERE quiz_set_id = ?
		ORDER BY id
	`, quizSetID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var questions []QuizQuestion
	for rows.Next() {
		var q QuizQuestion
		var optionsJSON, resourcesJSON string

		err := rows.Scan(&q.ID, &q.QuizSetID, &q.Question, &q.Description, &optionsJSON, &q.Answer, &resourcesJSON, &q.CreatedAt)
		if err != nil {
			return nil, err
		}

		// 解析JSON
		json.Unmarshal([]byte(optionsJSON), &q.Options)
		json.Unmarshal([]byte(resourcesJSON), &q.Resources)

		questions = append(questions, q)
	}

	return questions, nil
}

// SaveAttempt 保存答题记录
func SaveAttempt(c *gin.Context, attempt *QuizAttempt) (int64, error) {
	db := globals.GetDB(c)
	if db == nil {
		return 0, fmt.Errorf("database connection not found")
	}

	result, err := db.Exec(`
		INSERT INTO quiz_attempts (user_id, quiz_set_id, score, answers, time_spent, created_at)
		VALUES (?, ?, ?, ?, ?, ?)
	`, attempt.UserID, attempt.QuizSetID, attempt.Score, attempt.Answers, attempt.TimeSpent, attempt.CreatedAt)

	if err != nil {
		return 0, err
	}

	return result.LastInsertId()
}

// GetAttemptsByUser 获取用户的答题记录
func GetAttemptsByUser(c *gin.Context, userID int64) ([]QuizAttempt, error) {
	db := globals.GetDB(c)
	if db == nil {
		return nil, fmt.Errorf("database connection not found")
	}

	rows, err := db.Query(`
		SELECT id, user_id, quiz_set_id, score, answers, time_spent, created_at
		FROM quiz_attempts
		WHERE user_id = ?
		ORDER BY created_at DESC
	`, userID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var attempts []QuizAttempt
	for rows.Next() {
		var a QuizAttempt
		err := rows.Scan(&a.ID, &a.UserID, &a.QuizSetID, &a.Score, &a.Answers, &a.TimeSpent, &a.CreatedAt)
		if err != nil {
			return nil, err
		}
		attempts = append(attempts, a)
	}

	return attempts, nil
}

// GetAttemptByID 根据ID获取答题记录
func GetAttemptByID(c *gin.Context, id, userID int64) (*QuizAttempt, error) {
	db := globals.GetDB(c)
	if db == nil {
		return nil, fmt.Errorf("database connection not found")
	}

	var a QuizAttempt
	err := db.QueryRow(`
		SELECT id, user_id, quiz_set_id, score, answers, time_spent, created_at
		FROM quiz_attempts
		WHERE id = ? AND user_id = ?
	`, id, userID).Scan(&a.ID, &a.UserID, &a.QuizSetID, &a.Score, &a.Answers, &a.TimeSpent, &a.CreatedAt)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("attempt not found")
	}
	if err != nil {
		return nil, err
	}

	return &a, nil
}

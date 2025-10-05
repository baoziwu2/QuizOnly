package quiz

import "time"

// QuizDifficulty 难度等级
type QuizDifficulty string

const (
	DifficultyEasy   QuizDifficulty = "easy"
	DifficultyMedium QuizDifficulty = "medium"
	DifficultyHard   QuizDifficulty = "hard"
)

// QuizQuestion 题目结构
type QuizQuestion struct {
	ID          int64             `json:"id" db:"id"`
	QuizSetID   int64             `json:"quiz_set_id" db:"quiz_set_id"`
	Question    string            `json:"question" db:"question"`
	Description string            `json:"description" db:"description"`
	Options     map[string]string `json:"options" db:"options"`
	Answer      string            `json:"answer" db:"answer"`
	Resources   []string          `json:"resources,omitempty" db:"resources"`
	CreatedAt   time.Time         `json:"created_at" db:"created_at"`
}

// QuizSet 题目集
type QuizSet struct {
	ID          int64          `json:"id" db:"id"`
	UserID      int64          `json:"user_id" db:"user_id"`
	Title       string         `json:"title" db:"title"`
	Description string         `json:"description" db:"description"`
	Topic       string         `json:"topic" db:"topic"`
	Difficulty  QuizDifficulty `json:"difficulty" db:"difficulty"`
	QuestionNum int            `json:"question_num" db:"question_num"`
	CreatedAt   time.Time      `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at" db:"updated_at"`
}

// QuizAttempt 答题记录
type QuizAttempt struct {
	ID        int64     `json:"id" db:"id"`
	UserID    int64     `json:"user_id" db:"user_id"`
	QuizSetID int64     `json:"quiz_set_id" db:"quiz_set_id"`
	Score     float32   `json:"score" db:"score"`
	Answers   string    `json:"answers" db:"answers"`       // JSON格式存储用户答案
	TimeSpent int       `json:"time_spent" db:"time_spent"` // 答题用时（秒）
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

// GenerateQuizRequest 生成题目请求
type GenerateQuizRequest struct {
	Content    string         `json:"content" binding:"required"`    // 文本内容或文件标识
	Topic      string         `json:"topic"`                         // 主题
	Difficulty QuizDifficulty `json:"difficulty"`                    // 难度
	QuizCount  int            `json:"quiz_count" binding:"required"` // 题目数量
	Model      string         `json:"model"`                         // 使用的AI模型
}

// GenerateQuizResponse 生成题目响应
type GenerateQuizResponse struct {
	QuizSetID int64          `json:"quiz_set_id"`
	Questions []QuizQuestion `json:"questions"`
}

// SubmitAnswerRequest 提交答案请求
type SubmitAnswerRequest struct {
	QuizSetID int64            `json:"quiz_set_id" binding:"required"`
	Answers   map[int64]string `json:"answers" binding:"required"` // question_id -> answer
	TimeSpent int              `json:"time_spent"`
}

// SubmitAnswerResponse 提交答案响应
type SubmitAnswerResponse struct {
	AttemptID int64   `json:"attempt_id"`
	Score     float32 `json:"score"`
	TotalNum  int     `json:"total_num"`
	Correct   int     `json:"correct"`
}

// ListQuizSetsRequest 查询题目集请求
type ListQuizSetsRequest struct {
	Page     int    `json:"page" form:"page"`
	PageSize int    `json:"page_size" form:"page_size"`
	Topic    string `json:"topic" form:"topic"`
}

// ListQuizSetsResponse 查询题目集响应
type ListQuizSetsResponse struct {
	Total    int64     `json:"total"`
	QuizSets []QuizSet `json:"quiz_sets"`
}

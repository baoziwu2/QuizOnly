package quiz

import (
	"chat/utils"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// GenerateQuizHandler 生成题目处理器
func GenerateQuizHandler(c *gin.Context) {
	var req GenerateQuizRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user := utils.GetUserFromContext(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	// 验证题目数量范围
	if req.QuizCount < 1 || req.QuizCount > 50 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "quiz count must be between 1 and 50"})
		return
	}

	// 设置默认值
	if req.Difficulty == "" {
		req.Difficulty = DifficultyEasy
	}
	if req.Model == "" {
		req.Model = "gpt-3.5-turbo" // 默认模型
	}

	// 调用AI生成题目
	questions, err := GenerateQuestions(c, user, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 创建题目集
	quizSet := QuizSet{
		UserID:      user.GetID(),
		Title:       fmt.Sprintf("%s Quiz", req.Topic),
		Description: fmt.Sprintf("Generated quiz on %s", req.Topic),
		Topic:       req.Topic,
		Difficulty:  req.Difficulty,
		QuestionNum: len(questions),
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	// 保存题目集和题目
	quizSetID, err := SaveQuizSet(c, &quizSet, questions)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, GenerateQuizResponse{
		QuizSetID: quizSetID,
		Questions: questions,
	})
}

// ListQuizSetsHandler 获取题目集列表
func ListQuizSetsHandler(c *gin.Context) {
	var req ListQuizSetsRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user := utils.GetUserFromContext(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	// 设置默认分页参数
	if req.Page < 1 {
		req.Page = 1
	}
	if req.PageSize < 1 || req.PageSize > 100 {
		req.PageSize = 20
	}

	quizSets, total, err := GetQuizSetsByUser(c, user.GetID(), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, ListQuizSetsResponse{
		Total:    total,
		QuizSets: quizSets,
	})
}

// GetQuizSetHandler 获取题目集详情
func GetQuizSetHandler(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid quiz set id"})
		return
	}

	user := utils.GetUserFromContext(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	quizSet, err := GetQuizSetByID(c, id, user.GetID())
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "quiz set not found"})
		return
	}

	c.JSON(http.StatusOK, quizSet)
}

// DeleteQuizSetHandler 删除题目集
func DeleteQuizSetHandler(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid quiz set id"})
		return
	}

	user := utils.GetUserFromContext(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	err = DeleteQuizSet(c, id, user.GetID())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "quiz set deleted successfully"})
}

// GetQuestionsHandler 获取题目列表
func GetQuestionsHandler(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid quiz set id"})
		return
	}

	user := utils.GetUserFromContext(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	// 验证权限
	_, err = GetQuizSetByID(c, id, user.GetID())
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "quiz set not found"})
		return
	}

	questions, err := GetQuestionsByQuizSetID(c, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, questions)
}

// SubmitAnswerHandler 提交答案
func SubmitAnswerHandler(c *gin.Context) {
	var req SubmitAnswerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user := utils.GetUserFromContext(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	// 验证权限
	_, err := GetQuizSetByID(c, req.QuizSetID, user.GetID())
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "quiz set not found"})
		return
	}

	// 获取题目并计算分数
	questions, err := GetQuestionsByQuizSetID(c, req.QuizSetID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	correct := 0
	for _, q := range questions {
		if userAnswer, ok := req.Answers[q.ID]; ok {
			if strings.EqualFold(strings.TrimSpace(userAnswer), strings.TrimSpace(q.Answer)) {
				correct++
			}
		}
	}

	score := float32(correct) / float32(len(questions)) * 100

	// 保存答题记录
	answersJSON, _ := json.Marshal(req.Answers)
	attempt := QuizAttempt{
		UserID:    user.GetID(),
		QuizSetID: req.QuizSetID,
		Score:     score,
		Answers:   string(answersJSON),
		TimeSpent: req.TimeSpent,
		CreatedAt: time.Now(),
	}

	attemptID, err := SaveAttempt(c, &attempt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, SubmitAnswerResponse{
		AttemptID: attemptID,
		Score:     score,
		TotalNum:  len(questions),
		Correct:   correct,
	})
}

// ListAttemptsHandler 获取答题记录列表
func ListAttemptsHandler(c *gin.Context) {
	user := utils.GetUserFromContext(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	attempts, err := GetAttemptsByUser(c, user.GetID())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, attempts)
}

// GetAttemptDetailHandler 获取答题记录详情
func GetAttemptDetailHandler(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid attempt id"})
		return
	}

	user := utils.GetUserFromContext(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	attempt, err := GetAttemptByID(c, id, user.GetID())
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "attempt not found"})
		return
	}

	c.JSON(http.StatusOK, attempt)
}

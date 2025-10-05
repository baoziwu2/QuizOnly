package quiz

import (
	"chat/auth"
	"chat/globals"
	"chat/manager"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/gin-gonic/gin"
)

// GenerateQuestions 使用AI生成题目
func GenerateQuestions(c *gin.Context, user *auth.User, req *GenerateQuizRequest) ([]QuizQuestion, error) {
	// 构建提示词
	prompt := buildPrompt(req)

	// 调用AI模型生成题目
	messages := []globals.Message{
		{
			Role:    "system",
			Content: "You are an expert tutor who creates high-quality quiz questions to help students learn.",
		},
		{
			Role:    "user",
			Content: prompt,
		},
	}

	// 使用manager的NativeChatHandler来调用AI
	response, quota := manager.NativeChatHandler(c, user, req.Model, messages, false)

	if response == "" {
		return nil, fmt.Errorf("failed to generate quiz questions")
	}

	// 扣除额度
	if quota > 0 {
		user.UseQuota(quota)
	}

	// 解析AI返回的JSON
	questions, err := parseAIResponse(response)
	if err != nil {
		return nil, fmt.Errorf("failed to parse AI response: %v", err)
	}

	return questions, nil
}

// buildPrompt 构建生成题目的提示词
func buildPrompt(req *GenerateQuizRequest) string {
	difficulty := string(req.Difficulty)
	if difficulty == "" {
		difficulty = "easy"
	}

	prompt := fmt.Sprintf(`Generate %d quiz questions based on the following content with a difficulty level of %s.

Content:
%s

Requirements:
1. Generate exactly %d questions
2. Each question should have 4 options (a, b, c, d)
3. Provide a clear question, brief description, and the correct answer
4. Return the response in JSON format as an array of objects

JSON Format:
[
  {
    "id": 1,
    "question": "Question text here",
    "description": "Brief explanation or context",
    "options": {
      "a": "Option A text",
      "b": "Option B text",
      "c": "Option C text",
      "d": "Option D text"
    },
    "answer": "a",
    "resources": []
  }
]

Topic: %s
Difficulty: %s
Number of questions: %d

Please respond with ONLY the JSON array, no additional text.`,
		req.QuizCount, difficulty, req.Content, req.QuizCount, req.Topic, difficulty, req.QuizCount)

	return prompt
}

// parseAIResponse 解析AI返回的响应
func parseAIResponse(response string) ([]QuizQuestion, error) {
	// 清理响应，提取JSON部分
	response = strings.TrimSpace(response)

	// 尝试找到JSON数组的开始和结束
	startIdx := strings.Index(response, "[")
	endIdx := strings.LastIndex(response, "]")

	if startIdx == -1 || endIdx == -1 {
		return nil, fmt.Errorf("invalid JSON format in response")
	}

	jsonStr := response[startIdx : endIdx+1]

	// 定义一个临时结构来解析
	type TempQuestion struct {
		ID          int               `json:"id"`
		Question    string            `json:"question"`
		Description string            `json:"description"`
		Options     map[string]string `json:"options"`
		Answer      string            `json:"answer"`
		Resources   []string          `json:"resources,omitempty"`
	}

	var tempQuestions []TempQuestion
	err := json.Unmarshal([]byte(jsonStr), &tempQuestions)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal JSON: %v", err)
	}

	// 转换为QuizQuestion
	questions := make([]QuizQuestion, len(tempQuestions))
	for i, tq := range tempQuestions {
		questions[i] = QuizQuestion{
			Question:    tq.Question,
			Description: tq.Description,
			Options:     tq.Options,
			Answer:      tq.Answer,
			Resources:   tq.Resources,
		}
	}

	return questions, nil
}

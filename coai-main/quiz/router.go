package quiz

import (
	"github.com/gin-gonic/gin"
)

// Register 注册quiz相关路由
func Register(app *gin.RouterGroup) {
	quizGroup := app.Group("/quiz")
	{
		// 生成题目
		quizGroup.POST("/generate", GenerateQuizHandler)

		// 题目集管理
		quizGroup.GET("/sets", ListQuizSetsHandler)
		quizGroup.GET("/sets/:id", GetQuizSetHandler)
		quizGroup.DELETE("/sets/:id", DeleteQuizSetHandler)

		// 获取题目详情
		quizGroup.GET("/sets/:id/questions", GetQuestionsHandler)

		// 提交答案
		quizGroup.POST("/submit", SubmitAnswerHandler)

		// 答题记录
		quizGroup.GET("/attempts", ListAttemptsHandler)
		quizGroup.GET("/attempts/:id", GetAttemptDetailHandler)
	}
}

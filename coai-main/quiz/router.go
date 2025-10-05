package quiz

import "github.com/gin-gonic/gin"

// Register registers quiz routes
func Register(app *gin.RouterGroup) {
	group := app.Group("/quiz")
	{
		group.GET("/generate", GenerateQuizAPI)
	}
}

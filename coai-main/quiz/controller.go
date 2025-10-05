package quiz

import (
	adaptercommon "chat/adapter/common"
	"chat/admin"
	"chat/auth"
	"chat/channel"
	"chat/globals"
	"chat/utils"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/gin-gonic/gin"
)

var QuizPermissionGroup = []string{"quiz"}

// GenerateQuizAPI handles quiz generation via WebSocket
func GenerateQuizAPI(c *gin.Context) {
	var conn *utils.WebSocket
	if conn = utils.NewWebsocket(c, false); conn == nil {
		return
	}
	defer conn.DeferClose()

	form, err := utils.ReadForm[QuizGenerationRequest](conn)
	if err != nil {
		return
	}

	user := auth.ParseToken(c, form.Token)

	db := utils.GetDBFromContext(c)
	cache := utils.GetCacheFromContext(c)

	// Check if user has permission to use quiz feature
	if !auth.HitGroups(db, user, QuizPermissionGroup) {
		conn.Send(QuizGenerationResponse{
			Message: "permission denied: quiz feature not available",
			Quota:   0,
			End:     true,
			Error:   "permission denied",
		})
		return
	}

	// Validate model and subscription
	check, plan := auth.CanEnableModelWithSubscription(db, cache, user, form.Model, []globals.Message{})
	if check != nil {
		conn.Send(QuizGenerationResponse{
			Message: check.Error(),
			Quota:   0,
			End:     true,
			Error:   check.Error(),
		})
		return
	}

	// Set default values
	if form.QuizCount <= 0 {
		form.QuizCount = 5
	}
	if form.Difficulty == "" {
		form.Difficulty = "Easy"
	}

	// Generate quiz using the model
	var instance *utils.Buffer
	err = generateQuiz(c, user, *form, plan, conn, &instance)

	// Deduct quota if not using subscription
	if instance != nil && !plan && instance.GetQuota() > 0 && user != nil {
		user.UseQuota(db, instance.GetQuota())
	}

	if err != nil {
		auth.RevertSubscriptionUsage(db, cache, user, form.Model)
		conn.Send(QuizGenerationResponse{
			Message: fmt.Sprintf("failed to generate quiz: %s", err.Error()),
			Quota:   instance.GetQuota(),
			End:     true,
			Error:   err.Error(),
		})
		return
	}

	conn.Send(QuizGenerationResponse{
		Message: "quiz generation completed",
		Quota:   instance.GetQuota(),
		End:     true,
	})
}

// generateQuiz handles the actual quiz generation logic
func generateQuiz(c *gin.Context, user *auth.User, form QuizGenerationRequest, plan bool, conn *utils.WebSocket, bufferPtr **utils.Buffer) error {
	db := utils.GetDBFromContext(c)

	// Build the prompt for quiz generation
	prompt := buildQuizPrompt(form)

	// Create messages for the chat model
	messages := []globals.Message{
		{
			Role:    globals.User,
			Content: prompt,
		},
	}

	// Add file content if provided
	if len(form.Files) > 0 && len(form.FileMimes) > 0 {
		for i, fileData := range form.Files {
			if i < len(form.FileMimes) {
				messages = append(messages, globals.Message{
					Role:    globals.User,
					Content: fmt.Sprintf("data:%s;base64,%s", form.FileMimes[i], fileData),
				})
			}
		}
	}

	// Create buffer
	buffer := utils.NewBuffer(form.Model, messages, channel.ChargeInstance.GetCharge(form.Model))
	*bufferPtr = buffer

	// Stream the response using channel
	err := channel.NewChatRequest(
		auth.GetGroup(db, user),
		adaptercommon.CreateChatProps(&adaptercommon.ChatProps{
			OriginalModel: form.Model,
			Message:       messages,
		}, buffer),
		func(data *globals.Chunk) error {
			buffer.WriteChunk(data)
			// Send intermediate updates
			conn.Send(QuizGenerationResponse{
				Message: "generating quiz...",
				Data:    data.Content,
				Quota:   buffer.GetQuota(),
				End:     false,
			})
			return nil
		},
	)

	// Analyse request for admin dashboard
	admin.AnalyseRequest(form.Model, buffer, err)

	if err != nil {
		return err
	}

	// Get the complete response
	response := string(buffer.ReadBytes())

	// Send final response with the generated quiz data
	conn.Send(QuizGenerationResponse{
		Message: "quiz generation completed",
		Data:    response,
		Quota:   buffer.GetQuota(),
		End:     false,
	})

	return nil
}

// buildQuizPrompt constructs the prompt for quiz generation
func buildQuizPrompt(form QuizGenerationRequest) string {
	var builder strings.Builder

	builder.WriteString(fmt.Sprintf(
		"You are an all-rounder tutor with professional expertise in different fields. "+
			"You are to generate a list of quiz questions with a difficulty of %s. ",
		form.Difficulty,
	))

	if form.Topic != "" {
		builder.WriteString(fmt.Sprintf("The topic is: %s. ", form.Topic))
	}

	if form.Notes != "" {
		builder.WriteString(fmt.Sprintf("Use the following notes as the basis for the quiz:\n%s\n\n", form.Notes))
	}

	builder.WriteString(fmt.Sprintf(
		"Your response should be in JSON as an array of objects. Generate exactly %d different questions. "+
			"Each question should follow this structure:\n"+
			"{\n"+
			"  \"id\": \"1\",\n"+
			"  \"question\": \"Question text here\",\n"+
			"  \"description\": \"Additional context or explanation\",\n"+
			"  \"options\": {\n"+
			"    \"a\": \"Option A text\",\n"+
			"    \"b\": \"Option B text\",\n"+
			"    \"c\": \"Option C text\",\n"+
			"    \"d\": \"Option D text\"\n"+
			"  },\n"+
			"  \"answer\": \"a\" // The correct answer key (a, b, c, or d)\n"+
			"}\n\n"+
			"Return only the JSON array without any additional text or markdown formatting.",
		form.QuizCount,
	))

	return builder.String()
}

// ValidateQuizResponse checks if the generated response is valid JSON
func ValidateQuizResponse(response string) ([]Quiz, error) {
	// Remove potential markdown code blocks
	response = strings.TrimSpace(response)
	response = strings.TrimPrefix(response, "```json")
	response = strings.TrimPrefix(response, "```")
	response = strings.TrimSuffix(response, "```")
	response = strings.TrimSpace(response)

	var quizzes []Quiz
	if err := json.Unmarshal([]byte(response), &quizzes); err != nil {
		return nil, fmt.Errorf("invalid quiz response format: %v", err)
	}

	return quizzes, nil
}

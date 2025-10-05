package quiz

// QuizOption represents quiz answer options
type QuizOption struct {
	A string `json:"a"`
	B string `json:"b"`
	C string `json:"c"`
	D string `json:"d"`
}

// QuizResource represents additional learning resources
type QuizResource struct {
	Title string `json:"title"`
	Link  string `json:"link"`
}

// Quiz represents a single quiz question
type Quiz struct {
	ID          string         `json:"id"`
	Question    string         `json:"question"`
	Description string         `json:"description"`
	Options     QuizOption     `json:"options"`
	Answer      string         `json:"answer"`
	Resources   []QuizResource `json:"resources,omitempty"`
}

// QuizGenerationRequest represents the request body for quiz generation
type QuizGenerationRequest struct {
	Token      string   `json:"token"`
	Notes      string   `json:"notes,omitempty"`
	Files      []string `json:"files,omitempty"` // base64 encoded files
	FileMimes  []string `json:"file_mimes,omitempty"`
	QuizCount  int      `json:"quiz_count"`
	Difficulty string   `json:"difficulty"`
	Topic      string   `json:"topic,omitempty"`
	Model      string   `json:"model"`
}

// QuizGenerationResponse represents the streaming response
type QuizGenerationResponse struct {
	Message string  `json:"message"`
	Quota   float32 `json:"quota"`
	End     bool    `json:"end"`
	Error   string  `json:"error,omitempty"`
	Data    string  `json:"data,omitempty"` // JSON string of quiz array
}

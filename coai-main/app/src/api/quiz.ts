import { websocketEndpoint } from "@/conf/bootstrap.ts";
import { Quiz, QuizGenerationForm, QuizGenerationResponse } from "@/types/quiz.ts";

export const quizEndpoint = `${websocketEndpoint}/quiz/generate`;

export class QuizManager {
  private connection: WebSocket | null = null;
  private processing: boolean = false;
  private onMessage: ((response: QuizGenerationResponse) => void) | null = null;
  private onComplete: ((quizzes: Quiz[]) => void) | null = null;

  public isProcessing(): boolean {
    return this.processing;
  }

  public setProcessing(processing: boolean): void {
    this.processing = processing;
  }

  public generate(
    form: QuizGenerationForm,
    onMessage: (response: QuizGenerationResponse) => void,
    onComplete: (quizzes: Quiz[]) => void,
  ): void {
    this.setProcessing(true);
    this.onMessage = onMessage;
    this.onComplete = onComplete;

    this.connection = new WebSocket(quizEndpoint);

    this.connection.onopen = () => {
      this.connection?.send(JSON.stringify(form));
    };

    this.connection.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data) as QuizGenerationResponse;
        this.handleMessage(response);
      } catch (error) {
        console.error("Failed to parse quiz response:", error);
      }
    };

    this.connection.onerror = (error) => {
      console.error("WebSocket error:", error);
      this.setProcessing(false);
    };

    this.connection.onclose = () => {
      this.setProcessing(false);
    };
  }

  private handleMessage(response: QuizGenerationResponse): void {
    if (this.onMessage) {
      this.onMessage(response);
    }

    if (response.end) {
      this.setProcessing(false);
      if (this.connection) {
        this.connection.close();
        this.connection = null;
      }

      // Parse the final quiz data
      if (response.data && this.onComplete) {
        try {
          // Remove markdown code blocks if present
          let data = response.data.trim();
          data = data.replace(/^```json\s*/i, "").replace(/```\s*$/, "");
          data = data.trim();

          const quizzes = JSON.parse(data) as Quiz[];
          this.onComplete(quizzes);
        } catch (error) {
          console.error("Failed to parse quiz data:", error);
        }
      }
    }
  }

  public cancel(): void {
    if (this.connection) {
      this.connection.close();
      this.connection = null;
    }
    this.setProcessing(false);
  }
}

export const quizManager = new QuizManager();

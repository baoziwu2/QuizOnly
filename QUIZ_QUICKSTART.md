# Quiz 功能快速开始指南

## 用户使用指南

### 1. 生成题目

访问 `http://your-domain/quiz`

1. 输入主题（必填）
2. 选择输入方式：
   - **文本输入**：直接粘贴学习内容
   - **文件上传**：上传文本文件（支持 txt, md, pdf, docx）
3. 配置参数：
   - **难度**：简单/中等/困难
   - **题目数量**：5/10/15/20题
   - **AI模型**：选择使用的模型
4. 点击"生成测验"按钮

### 2. 答题

1. 等待题目生成完成
2. 逐题作答，选择您认为正确的选项
3. 可以返回修改已答题目
4. 所有题目完成后，点击"完成"按钮
5. 点击"提交答案"确认提交

### 3. 查看结果

- 查看您的得分和评级
- 查看答对/答错的题目数量
- 查看正确率
- 可选择：
  - **重新生成题目**：返回表单页面
  - **查看历史记录**：查看所有答题记录

### 4. 历史记录

访问 `http://your-domain/quiz/history`

#### 题目集标签页
- 查看所有创建的题目集
- 可以重做任何题目集
- 可以删除不需要的题目集

#### 答题记录标签页
- 查看所有答题历史
- 显示得分、用时等信息
- 按时间倒序排列

## 开发者指南

### 添加新的难度等级

在 `quiz/types.go` 中：

```go
const (
    DifficultyEasy      QuizDifficulty = "easy"
    DifficultyMedium    QuizDifficulty = "medium"
    DifficultyHard      QuizDifficulty = "hard"
    DifficultyExpert    QuizDifficulty = "expert"  // 新增
)
```

### 自定义题目格式

在 `quiz/generator.go` 的 `buildPrompt` 函数中修改提示词模板。

### 添加更多选项

修改 `QuizQuestion` 结构体中的 `Options` 字段类型，支持更灵活的选项格式。

### 集成其他 AI 模型

在 `quiz/generator.go` 中，`GenerateQuestions` 函数已经通过 `manager.NativeChatHandler` 调用，会自动使用 Chat Nio 配置的所有可用模型。

## 计费说明

- 生成题目会消耗 AI 额度
- 额度消耗量取决于：
  - 使用的 AI 模型
  - 题目数量
  - 内容长度
- 答题和查看历史记录不消耗额度

## 技术栈

**后端**
- Go 1.21+
- Gin Web Framework
- SQLite/MySQL/PostgreSQL

**前端**
- React 18
- TypeScript
- Shadcn UI
- TailwindCSS
- Lucide Icons

## 贡献指南

欢迎提交 Issue 和 Pull Request！

### 提交前请确保：

1. 代码符合项目规范
2. 添加必要的注释
3. 更新相关文档
4. 通过所有测试

## License

本功能遵循 Chat Nio 项目的 Apache-2.0 开源协议。

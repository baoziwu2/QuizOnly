# Chat Nio + AI出题功能 - 项目合并说明

## 概述

本文档说明了如何将 Quiznote 的 AI 出题功能集成到 Chat Nio 项目中。合并后的项目在保持 Chat Nio 原有功能的基础上，新增了智能测验题目生成、答题和管理功能。

## 项目架构

### 后端架构 (Go)

新增 `quiz` 模块，包含以下文件：

```
coai-main/
├── quiz/
│   ├── types.go          # 数据结构定义
│   ├── router.go         # 路由注册
│   ├── controller.go     # HTTP 处理器
│   ├── database.go       # 数据库操作
│   ├── generator.go      # AI 题目生成
│   └── migration.go      # 数据库迁移 SQL
```

### 前端架构 (React + TypeScript)

新增 quiz 相关组件和页面：

```
coai-main/app/src/
├── components/
│   └── quiz/
│       ├── QuizForm.tsx      # 题目生成表单
│       ├── QuizPlayer.tsx    # 答题界面
│       └── QuizResult.tsx    # 结果展示
├── routes/
│   ├── Quiz.tsx              # 主页面
│   └── QuizHistory.tsx       # 历史记录
└── api/
    └── quiz.ts               # API 调用封装
```

## 核心功能

### 1. AI 题目生成

- **路径**: `/api/quiz/generate`
- **方法**: POST
- **功能**: 根据用户提供的文本或文件内容，使用 AI 模型生成测验题目
- **参数**:
  - `content`: 学习内容（必填）
  - `topic`: 主题（必填）
  - `difficulty`: 难度（easy/medium/hard）
  - `quiz_count`: 题目数量（1-50）
  - `model`: AI 模型选择

**特点**:
- 利用 Chat Nio 现有的多模型支持系统
- 自动扣除用户额度
- 支持自定义难度和题目数量
- JSON 格式返回标准化题目

### 2. 题目集管理

提供完整的 CRUD 操作：

- **创建**: 自动创建题目集（生成题目时）
- **查询**: 
  - 列表查询 `/api/quiz/sets` (支持分页和主题筛选)
  - 详情查询 `/api/quiz/sets/:id`
  - 题目查询 `/api/quiz/sets/:id/questions`
- **删除**: `/api/quiz/sets/:id`

### 3. 答题功能

- **路径**: `/api/quiz/submit`
- **方法**: POST
- **功能**: 提交答案并自动评分
- **特点**:
  - 实时计分
  - 记录答题时间
  - 保存答题历史
  - 返回详细结果统计

### 4. 历史记录

- **答题记录**: `/api/quiz/attempts`
- **记录详情**: `/api/quiz/attempts/:id`
- 支持查看历史成绩和答题情况

## 数据库设计

### quiz_sets (题目集表)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| user_id | INTEGER | 用户ID（外键） |
| title | VARCHAR(255) | 标题 |
| description | TEXT | 描述 |
| topic | VARCHAR(100) | 主题 |
| difficulty | VARCHAR(20) | 难度 |
| question_num | INTEGER | 题目数量 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

### quiz_questions (题目表)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| quiz_set_id | INTEGER | 题目集ID（外键） |
| question | TEXT | 题目内容 |
| description | TEXT | 题目说明 |
| options | TEXT | 选项（JSON） |
| answer | VARCHAR(10) | 正确答案 |
| resources | TEXT | 参考资源（JSON） |
| created_at | DATETIME | 创建时间 |

### quiz_attempts (答题记录表)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| user_id | INTEGER | 用户ID（外键） |
| quiz_set_id | INTEGER | 题目集ID（外键） |
| score | FLOAT | 得分 |
| answers | TEXT | 答案（JSON） |
| time_spent | INTEGER | 用时（秒） |
| created_at | DATETIME | 答题时间 |

## 集成说明

### 1. 认证和权限

Quiz 功能已完全集成到 Chat Nio 的认证系统：

- 所有 quiz API 都需要用户认证
- 使用现有的 `auth.User` 接口获取用户信息
- 支持用户级别的数据隔离

### 2. 计费系统

- 生成题目时自动调用 `manager.NativeChatHandler`
- 根据使用的 AI 模型和生成内容自动计算并扣除额度
- 与现有的订阅制和弹性计费系统无缝集成

### 3. UI 设计

- 遵循 Chat Nio 的 Shadcn UI 设计规范
- 响应式设计，支持 PC/平板/移动端
- 保持与主项目一致的视觉风格

## 部署步骤

### 1. 数据库迁移

```bash
# 在数据库中执行迁移 SQL
# 文件: coai-main/quiz/migration.go
```

或在应用启动时自动执行：

```go
// 在 main.go 或 connection/db_migration.go 中添加
import "chat/quiz"

func init() {
    // 执行 quiz 表创建
    db.Exec(quiz.CreateQuizTablesSQL)
}
```

### 2. 后端部署

已自动集成，无需额外配置：

```go
// main.go 已包含
quiz.Register(app)
```

### 3. 前端构建

```bash
cd coai-main/app
npm install  # 或 pnpm install
npm run build
```

### 4. 访问地址

- 题目生成: `http://your-domain/quiz`
- 历史记录: `http://your-domain/quiz/history`

## API 文档

### 生成题目

```
POST /api/quiz/generate
Content-Type: application/json
Authorization: Bearer <token>

{
  "content": "JavaScript is a programming language...",
  "topic": "JavaScript 基础",
  "difficulty": "easy",
  "quiz_count": 5,
  "model": "gpt-3.5-turbo"
}

Response:
{
  "quiz_set_id": 1,
  "questions": [
    {
      "id": 1,
      "quiz_set_id": 1,
      "question": "What is JavaScript?",
      "description": "Basic concept",
      "options": {
        "a": "A programming language",
        "b": "A database",
        "c": "An operating system",
        "d": "A web server"
      },
      "answer": "a",
      "resources": [],
      "created_at": "2025-10-05T10:00:00Z"
    }
  ]
}
```

### 提交答案

```
POST /api/quiz/submit
Content-Type: application/json
Authorization: Bearer <token>

{
  "quiz_set_id": 1,
  "answers": {
    "1": "a",
    "2": "b"
  },
  "time_spent": 120
}

Response:
{
  "attempt_id": 1,
  "score": 80.0,
  "total_num": 5,
  "correct": 4
}
```

### 获取题目集列表

```
GET /api/quiz/sets?page=1&page_size=20&topic=JavaScript
Authorization: Bearer <token>

Response:
{
  "total": 10,
  "quiz_sets": [
    {
      "id": 1,
      "user_id": 1,
      "title": "JavaScript Quiz",
      "description": "Generated quiz on JavaScript",
      "topic": "JavaScript",
      "difficulty": "easy",
      "question_num": 5,
      "created_at": "2025-10-05T10:00:00Z",
      "updated_at": "2025-10-05T10:00:00Z"
    }
  ]
}
```

## 扩展功能建议

### 后台管理

可以添加以下管理功能：

1. **题目统计**
   - 总题目数
   - 各难度分布
   - 热门主题

2. **用户统计**
   - 答题次数
   - 平均分数
   - 活跃度分析

3. **配置管理**
   - 默认模型设置
   - 题目数量限制
   - 计费规则配置

### 高级功能

1. **题目导出**
   - 支持导出为 PDF/Word
   - 批量导出功能

2. **题目分享**
   - 生成分享链接
   - 公开题库

3. **错题本**
   - 记录错误题目
   - 针对性练习

4. **学习路径**
   - 根据答题情况推荐
   - 个性化学习计划

## 代码维护性

### 模块化设计

- Quiz 功能完全独立，不影响原有功能
- 清晰的文件组织和职责划分
- 易于扩展和维护

### 代码规范

- 遵循 Go 和 TypeScript 最佳实践
- 完整的类型定义
- 详细的注释说明

### 测试建议

```go
// 后端测试
func TestGenerateQuiz(t *testing.T) {
    // 测试题目生成
}

func TestSubmitAnswer(t *testing.T) {
    // 测试答案提交和评分
}
```

```typescript
// 前端测试
describe('QuizForm', () => {
  it('should validate form inputs', () => {
    // 测试表单验证
  });
});
```

## 常见问题

### Q: 如何更换默认 AI 模型？

A: 在 `quiz/generator.go` 中修改默认模型：

```go
if req.Model == "" {
    req.Model = "gpt-4" // 修改为其他模型
}
```

### Q: 如何调整题目数量限制？

A: 在 `quiz/controller.go` 中修改验证逻辑：

```go
if req.QuizCount < 1 || req.QuizCount > 50 { // 修改最大值
    c.JSON(http.StatusBadRequest, gin.H{"error": "quiz count must be between 1 and 50"})
    return
}
```

### Q: 如何自定义评分规则？

A: 在 `quiz/controller.go` 的 `SubmitAnswerHandler` 中修改评分逻辑。

## 总结

本次合并成功地将 Quiznote 的核心功能集成到 Chat Nio 项目中，实现了：

✅ 完整的后端 API 系统  
✅ 现代化的前端交互界面  
✅ 与现有系统的无缝集成  
✅ 良好的代码可维护性  
✅ 清晰的文档和使用说明  

合并后的系统不仅保留了 Chat Nio 的所有原有功能，还新增了强大的 AI 出题能力，为用户提供了更丰富的学习和测验体验。

# Quiz功能集成文档

## 概述

Quiz功能已成功集成到Chat Nio平台中。该功能允许用户将学习笔记或材料转换为互动测验，帮助最大化学习效果。

## 功能特性

1. **智能测验生成**
   - 支持从文本笔记生成测验
   - 支持上传文件（PDF、DOCX、TXT、图片等）
   - 可自定义题目数量（1-20题）
   - 支持三个难度级别：简单、中等、困难
   - 可选择不同的AI模型

2. **交互式答题**
   - 实时显示进度
   - 选择题形式
   - 即时反馈
   - 计分系统

3. **结果汇总**
   - 显示总分和正确答案数
   - 提供成绩评估
   - 支持重新生成测验

## 技术实现

### 后端架构

#### 文件结构
```
coai-main/
├── quiz/
│   ├── types.go          # 类型定义
│   ├── controller.go     # 业务逻辑
│   └── router.go         # 路由注册
└── main.go               # 主入口（已注册quiz模块）
```

#### 核心组件

1. **类型定义 (types.go)**
   - `Quiz`: 测验题目结构
   - `QuizGenerationRequest`: 生成请求
   - `QuizGenerationResponse`: 生成响应

2. **控制器 (controller.go)**
   - `GenerateQuizAPI`: WebSocket端点处理
   - `generateQuiz`: 核心生成逻辑
   - `buildQuizPrompt`: 构建AI提示词
   - `ValidateQuizResponse`: 响应验证

3. **路由 (router.go)**
   - `/api/quiz/generate`: WebSocket端点

### 前端架构

#### 文件结构
```
coai-main/app/src/
├── routes/quiz/
│   └── index.tsx              # 主页面
├── components/quiz/
│   ├── QuizForm.tsx           # 表单组件
│   ├── QuizLoading.tsx        # 加载组件
│   ├── QuizContainer.tsx      # 答题组件
│   └── QuizSummary.tsx        # 结果汇总组件
├── store/
│   └── quiz.ts                # Redux状态管理
├── api/
│   └── quiz.ts                # WebSocket客户端
├── types/
│   └── quiz.ts                # TypeScript类型定义
└── assets/pages/
    └── quiz.less              # 样式文件
```

#### 状态管理

使用Redux进行状态管理：
- `quizzes`: 测验题目列表
- `index`: 当前题目索引
- `selectedAnswer`: 用户选择的答案
- `points`: 单题分数
- `totalPoints`: 总分
- `status`: 流程状态（idle/streaming/done/start/summary）
- `streamContent`: 流式内容缓存

### API接口

#### WebSocket端点

**URL**: `ws://your-domain/api/quiz/generate`

**请求格式**:
```json
{
  "token": "用户token",
  "notes": "学习笔记内容",
  "files": ["base64编码的文件1", "base64编码的文件2"],
  "file_mimes": ["application/pdf", "image/png"],
  "quiz_count": 5,
  "difficulty": "Medium",
  "topic": "可选主题",
  "model": "gpt-3.5-turbo"
}
```

**响应格式**:
```json
{
  "message": "状态消息",
  "quota": 0.5,
  "end": false,
  "data": "生成的JSON字符串",
  "error": "错误信息（如有）"
}
```

**生成的Quiz格式**:
```json
[
  {
    "id": "1",
    "question": "问题内容",
    "description": "问题描述",
    "options": {
      "a": "选项A",
      "b": "选项B",
      "c": "选项C",
      "d": "选项D"
    },
    "answer": "a"
  }
]
```

## 使用方法

### 用户使用

1. 登录Chat Nio平台
2. 导航到 `/quiz` 页面
3. 填写表单：
   - （可选）输入主题
   - 输入学习笔记或上传文件
   - 选择难度级别
   - 设置题目数量
   - 选择AI模型
4. 点击"生成测验"
5. 等待AI生成完成
6. 点击"开始测验"进行答题
7. 查看结果并选择重新测验或退出

### 开发者使用

1. **导入组件**:
```typescript
import QuizPage from "@/routes/quiz/index.tsx";
```

2. **使用Redux状态**:
```typescript
import { useSelector, useDispatch } from "react-redux";
import { quizSelector, setStatus, setQuizzes } from "@/store/quiz.ts";

const { quizzes, status } = useSelector(quizSelector);
const dispatch = useDispatch();
```

3. **调用API**:
```typescript
import { quizManager } from "@/api/quiz.ts";

quizManager.generate(form, onMessage, onComplete);
```

## 权限配置

Quiz功能需要用户具有 `quiz` 权限组。管理员可以在后台管理界面配置用户组权限。

## 国际化

已添加中英文翻译支持：
- 英文: `en.json` 
- 中文: `cn.json`

翻译键前缀: `quiz.*`

## 与原有系统的集成点

1. **认证系统**: 使用coai的认证和权限系统
2. **AI模型管理**: 复用coai的模型适配器和渠道管理
3. **配额系统**: 使用coai的配额计费系统
4. **状态管理**: 集成到Redux store
5. **路由系统**: 集成到React Router
6. **UI组件**: 复用coai的Shadcn UI组件库

## 注意事项

1. **权限管理**: 
   - 用户需要登录才能使用
   - 需要具有`quiz`权限组

2. **文件上传**:
   - 支持格式: PDF, DOCX, TXT, PNG, JPG, JPEG
   - 文件将被转换为base64发送

3. **AI模型**:
   - 使用coai现有的模型管理系统
   - 支持所有配置的文本生成模型
   - 建议使用Gemini或GPT-4系列

4. **配额消耗**:
   - 每次生成会根据使用的模型和token数消耗配额
   - 配额计算与普通对话一致

## 未来扩展

1. 支持更多题型（多选题、填空题、判断题等）
2. 题库管理功能
3. 学习进度跟踪
4. 错题本功能
5. 协作学习功能

## 故障排查

### 常见问题

1. **无法生成测验**
   - 检查用户是否已登录
   - 确认用户具有quiz权限
   - 检查配额是否充足
   - 查看浏览器控制台错误

2. **WebSocket连接失败**
   - 检查后端服务是否运行
   - 确认WebSocket端点配置正确
   - 检查防火墙设置

3. **解析错误**
   - 可能是AI模型返回格式不正确
   - 尝试更换模型
   - 减少题目数量

## 维护建议

1. 定期检查AI生成质量
2. 监控WebSocket连接稳定性
3. 收集用户反馈优化体验
4. 根据使用情况调整提示词

## 联系方式

如有问题或建议，请通过以下方式联系：
- Issue: GitHub Issues
- Email: support@chatnio.com

---

最后更新: 2025年10月5日
版本: 1.0.0

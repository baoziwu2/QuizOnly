# Quiz功能快速启动指南

## 🚀 快速开始

### 前置条件

- Go 1.20+
- Node.js 18+
- Docker (可选)
- Git

### 1. 安装依赖

#### 后端
```bash
cd coai-main
go mod download
```

#### 前端
```bash
cd coai-main/app
npm install
# 或
pnpm install
```

### 2. 配置

使用coai现有的配置文件 `config.yaml`，无需额外配置。

### 3. 启动开发服务器

#### 方式一：本地运行

```bash
# 终端1 - 启动后端
cd coai-main
go run main.go

# 终端2 - 启动前端
cd coai-main/app
npm run dev
```

访问: `http://localhost:5173/quiz`

#### 方式二：Docker运行

```bash
cd coai-main
docker-compose up -d
```

访问: `http://localhost/quiz`

### 4. 配置权限

1. 访问管理后台: `http://localhost/admin`
2. 登录管理员账号
3. 进入"用户管理" → "用户组"
4. 为目标用户组启用 `quiz` 权限

## 📱 使用示例

### 基本使用

1. **登录系统**
   ```
   访问: http://localhost/login
   ```

2. **进入Quiz页面**
   ```
   访问: http://localhost/quiz
   ```

3. **生成测验**
   - 输入学习笔记或上传文件
   - 设置难度和题目数量
   - 选择AI模型
   - 点击"生成测验"

4. **开始答题**
   - 等待生成完成
   - 点击"开始测验"
   - 选择答案并提交

5. **查看结果**
   - 完成所有题目
   - 查看得分和统计
   - 选择重新测验或退出

### API使用

#### WebSocket连接

```javascript
const ws = new WebSocket('ws://localhost:8080/api/quiz/generate');

ws.onopen = () => {
  ws.send(JSON.stringify({
    token: 'your-token',
    notes: 'Your study notes here',
    quiz_count: 5,
    difficulty: 'Medium',
    model: 'gpt-3.5-turbo'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Response:', data);
  
  if (data.end && data.data) {
    const quizzes = JSON.parse(data.data);
    console.log('Generated quizzes:', quizzes);
  }
};
```

#### 使用React Hook

```typescript
import { quizManager } from '@/api/quiz';

function MyComponent() {
  const generateQuiz = () => {
    quizManager.generate(
      {
        token: 'your-token',
        notes: 'Study notes',
        quiz_count: 5,
        difficulty: 'Easy',
        model: 'gpt-3.5-turbo'
      },
      (response) => {
        // 处理每次响应
        console.log(response);
      },
      (quizzes) => {
        // 生成完成
        console.log('Complete:', quizzes);
      }
    );
  };
  
  return <button onClick={generateQuiz}>Generate</button>;
}
```

## 🔧 开发指南

### 修改后端

编辑 `coai-main/quiz/` 目录下的文件：

```go
// quiz/controller.go
func GenerateQuizAPI(c *gin.Context) {
    // 添加你的逻辑
}
```

### 修改前端

编辑 `coai-main/app/src/` 目录下的文件：

```typescript
// components/quiz/QuizForm.tsx
function QuizForm({ onSubmit }: QuizFormProps) {
  // 添加你的逻辑
}
```

### 添加新功能

1. **后端添加新API**
   ```go
   // quiz/controller.go
   func NewAPI(c *gin.Context) {
       // 实现
   }
   
   // quiz/router.go
   group.GET("/new-endpoint", NewAPI)
   ```

2. **前端添加新组件**
   ```typescript
   // components/quiz/NewComponent.tsx
   function NewComponent() {
       return <div>New Feature</div>;
   }
   ```

## 🐛 故障排查

### 常见问题

1. **无法访问Quiz页面**
   ```bash
   # 检查路由是否正确
   # 查看浏览器控制台
   # 确认后端服务运行正常
   ```

2. **生成失败**
   ```bash
   # 检查用户权限
   # 确认AI模型配置
   # 查看后端日志
   tail -f coai-main/logs/app.log
   ```

3. **WebSocket连接失败**
   ```bash
   # 检查端口是否开放
   netstat -an | grep 8080
   
   # 检查防火墙设置
   # 确认WebSocket端点配置
   ```

### 调试模式

启用详细日志：

```bash
# 后端
export LOG_LEVEL=debug
go run main.go

# 前端
npm run dev -- --debug
```

## 📊 性能优化

### 后端优化

1. **启用缓存**
   ```go
   // 在controller.go中添加缓存逻辑
   ```

2. **连接池优化**
   ```yaml
   # config.yaml
   database:
     max_connections: 100
   ```

### 前端优化

1. **懒加载**
   ```typescript
   const Quiz = lazy(() => import('@/routes/quiz'));
   ```

2. **Memo化组件**
   ```typescript
   export default memo(QuizForm);
   ```

## 🧪 测试

### 单元测试

```bash
# 后端测试
cd coai-main
go test ./quiz/...

# 前端测试
cd coai-main/app
npm run test
```

### 集成测试

```bash
# 运行完整测试套件
npm run test:e2e
```

## 📦 部署

### Docker部署

```bash
# 构建镜像
docker build -t coai-quiz:latest .

# 运行容器
docker run -p 8080:8080 coai-quiz:latest
```

### 生产环境

```bash
# 使用docker-compose
cd coai-main
docker-compose -f docker-compose.yaml up -d
```

## 🔐 安全配置

### 权限设置

在管理后台配置Quiz权限：

1. 用户组管理
2. 启用 `quiz` 权限
3. 设置配额限制

### API限流

```yaml
# config.yaml
rate_limit:
  quiz:
    requests_per_minute: 10
```

## 📚 更多资源

- 📖 [完整技术文档](./QUIZ_INTEGRATION.md)
- 📖 [合并总结](./MERGE_SUMMARY.md)
- 📖 [Coai主文档](./README.md)
- 🐙 [GitHub仓库](https://github.com/Deeptrain-Community/chatnio)
- 💬 [Discord社区](https://discord.gg/rpzNSmqaF2)

## 🤝 贡献指南

欢迎贡献代码！

1. Fork项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 📄 License

Apache-2.0 License

## 💬 获取帮助

- Issue: GitHub Issues
- Email: support@chatnio.com
- Discord: [加入社区](https://discord.gg/rpzNSmqaF2)

---

🎉 **祝你使用愉快！** 如有问题欢迎反馈。

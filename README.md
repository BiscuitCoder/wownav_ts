# Wownav Server

基于 TypeScript 和 Express 的服务端项目。

## 功能特点

- TypeScript 支持
- Express 框架
- CORS 支持
- 环境变量配置
- 开发环境热重载

## 开始使用

1. 安装依赖：
```bash
npm install
```

2. 开发环境运行：
```bash
npm run dev
```

3. 构建项目：
```bash
npm run build
```

4. 生产环境运行：
```bash
npm start
```

## 项目结构

```
src/
  ├── index.ts          # 应用入口文件
  ├── routes/           # 路由文件
  ├── controllers/      # 控制器
  ├── models/          # 数据模型
  ├── services/        # 业务逻辑
  └── utils/           # 工具函数
```

## 环境变量

创建 `.env` 文件并配置以下变量：

- `PORT`: 服务器端口号（默认：3000）
- `NODE_ENV`: 运行环境（development/production） 
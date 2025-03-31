# Wownav Server

基于 TypeScript 和 Express 的服务端项目，用于管理和生成导航站点。

## 功能特点

- TypeScript 支持
- Express 框架
- CORS 支持
- 环境变量配置
- 开发环境热重载
- 站点配置管理
- 验证码生成和验证
- 文件上传和处理
- 站点地图生成
- 站点缓存机制

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

## Docker 部署

### 快速部署

1. 给启动脚本添加执行权限：
```bash
chmod +x start.sh
```

2. 运行启动脚本（必需提供 SITE_PASSWORD_SALT）：
```bash
# 基本用法
./start.sh -s your_random_salt_string

# 自定义端口和主机地址
./start.sh -s your_random_salt_string -p 8080 -h http://your-domain.com
```

启动脚本参数说明：
- `-s <SITE_PASSWORD_SALT>`: 站点密码加密盐值（必需）
- `-p <PORT>`: 端口号（可选，默认：3008）
- `-h <HOST>`: 主机地址（可选，默认：http://localhost:3008）

启动脚本会自动：
- 检查 Docker 是否安装
- 创建必要的数据目录
- 构建 Docker 镜像
- 启动容器
- 配置数据持久化
- 设置环境变量

### 手动部署

1. 构建镜像：
```bash
docker build -t wownav .
```

2. 运行容器：
```bash
docker run -d \
  -p 3008:3000 \
  -v /path/to/your/public:/app/public \
  -e PORT=3000 \
  -e NODE_ENV=production \
  -e HOST=http://your-domain.com \
  -e SITE_PASSWORD_SALT=your_random_salt_string \
  --name wownav \
  wownav
```

### Docker 部署说明

- `-p 3008:3000`: 将容器的 3000 端口映射到主机的 3008 端口
- `-v /path/to/your/public:/app/public`: 将站点数据目录挂载到宿主机
- `-e`: 设置环境变量，可以根据需要修改

### 数据持久化

- 站点配置文件存储在容器的 `/app/public` 目录
- 通过 volume 挂载实现数据持久化
- 建议定期备份 `public` 目录

## 项目结构

```
src/
  ├── index.ts          # 应用入口文件
  ├── routes/           # 路由文件
  │   ├── upload/      # 上传相关路由
  │   └── manage/      # 管理相关路由
  ├── controllers/      # 控制器
  ├── models/          # 数据模型
  ├── services/        # 业务逻辑
  ├── utils/           # 工具函数
  └── templates/       # EJS 模板文件
```

## 环境变量

在项目根目录创建 `.env` 文件并配置以下变量：

```env
# 服务器配置
PORT=3008
NODE_ENV=development

# API 配置
HOST=http://localhost:3008

# 安全配置
SITE_PASSWORD_SALT=your_random_salt_string
```

### 环境变量说明

- `PORT`: 服务器端口号（默认：3000）
- `NODE_ENV`: 运行环境（development/production）
- `HOST`: API 服务器地址（例如：http://localhost:3008）
- `SITE_PASSWORD_SALT`: 站点密码加密盐值（建议使用随机字符串）

### 注意事项

1. `.env` 文件不应该提交到版本控制系统
2. 生产环境建议使用更复杂的 `SITE_PASSWORD_SALT` 值
3. 确保 `HOST` 地址与实际的服务器地址一致

## API 接口

### 站点管理
- `POST /api/upload/config`: 创建/更新站点配置
- `GET /api/upload/sites`: 获取站点列表
- `GET /api/upload/sitemap`: 获取站点地图

### 验证码
- `GET /api/upload/captcha/generate`: 生成验证码
- `POST /api/upload/captcha/verify`: 验证验证码

## 开发说明

1. 开发时使用 `npm run dev` 启动服务，支持热重载
2. 生产环境使用 `npm run build` 构建后，通过 `npm start` 启动
3. 确保配置正确的环境变量，特别是 `HOST` 和 `SITE_PASSWORD_SALT`
4. 站点配置文件存储在 `public` 目录下 
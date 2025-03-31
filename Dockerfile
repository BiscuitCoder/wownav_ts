# 使用 Node.js 18 作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 安装基本构建工具
RUN apk add --no-cache \
    python3 \
    make \
    g++

# 复制 package.json 和 package-lock.json（如果存在）
COPY package*.json ./

# 安装项目依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建 TypeScript 代码
RUN npm run build

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production

# 启动应用
CMD ["npm", "start"] 
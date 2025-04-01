# 使用 Node.js 18 作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 设置 Alpine 国内镜像源
RUN echo "https://mirrors.aliyun.com/alpine/v3.18/main" > /etc/apk/repositories && \
    echo "https://mirrors.aliyun.com/alpine/v3.18/community" >> /etc/apk/repositories

# 安装 canvas 依赖和字体
RUN apk add --update --no-cache \
    make \
    g++ \
    jpeg-dev \
    cairo-dev \
    giflib-dev \
    pango-dev \
    libtool \
    autoconf \
    automake \
    python3 \
    pixman-dev \
    freetype-dev \
    fontconfig-dev \
    pkgconfig \
    build-base \
    gcc \
    musl-dev \
    libpng-dev \
    librsvg-dev \
    ttf-dejavu \
    ttf-droid \
    ttf-freefont \
    ttf-liberation \
    font-noto \
    font-noto-cjk

# 设置国内镜像源
RUN npm config set registry https://registry.npmmirror.com

# 安装 pnpm 和 node-gyp
RUN npm install -g pnpm node-gyp && \
    pnpm config set registry https://registry.npmmirror.com

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装项目依赖并重新构建 canvas
RUN pnpm install && \
    cd node_modules/canvas && \
    node-gyp rebuild && \
    cd ../..

# 复制源代码
COPY . .

# 构建 TypeScript 代码
RUN pnpm run build

# 暴露端口
EXPOSE 3008

# 设置环境变量
ENV NODE_ENV=production
ENV PKG_CONFIG_PATH=/usr/lib/pkgconfig:/usr/share/pkgconfig

# 启动应用
CMD ["pnpm", "start"] 
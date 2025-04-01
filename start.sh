#!/bin/bash

# 显示使用说明
show_usage() {
    echo "使用方法: $0 -s <SITE_PASSWORD_SALT> [-p <PORT>] [-h <HOST>]"
    echo "参数说明:"
    echo "  -s <SITE_PASSWORD_SALT>  站点密码加密盐值（必需）"
    echo "  -p <PORT>                端口号（可选，默认：3008）"
    echo "  -h <HOST>                主机地址（可选，默认：http://localhost:3008）"
    exit 1
}

# 设置默认值
PORT=3008
HOST="http://localhost:3008"
PUBLIC_DIR="./public"

# 解析命令行参数
while getopts "s:p:h:" opt; do
    case $opt in
        s) SALT="$OPTARG";;
        p) PORT="$OPTARG";;
        h) HOST="$OPTARG";;
        \?) show_usage;;
    esac
done

# 检查必需参数
[ -z "$SALT" ] && { echo "错误: 必须提供 SITE_PASSWORD_SALT 参数"; show_usage; }

# 检查 Docker
command -v docker &> /dev/null || { echo "错误: 未安装 Docker"; exit 1; }

# 创建数据目录
mkdir -p "$PUBLIC_DIR"

# 停止并删除已存在的容器
docker ps -a --format '{{.Names}}' | grep -q "^wownav_ts$" && {
    docker stop wownav_ts
    docker rm wownav_ts
}

# 构建并启动容器
echo "构建并启动容器..."
docker build -t wownav_ts . && \
docker run -d \
    -p $PORT:3008 \
    -v "/www/wwwroot/wownav_ts_public:/app/public" \
    -e PORT=3008 \
    -e NODE_ENV=production \
    -e HOST=$HOST \
    -e SITE_PASSWORD_SALT=$SALT \
    --name wownav_ts \
    wownav_ts

# 检查启动状态
if docker ps --format '{{.Names}}' | grep -q "^wownav_ts$"; then
    echo "部署成功！"
    echo "访问地址: $HOST"
    echo "数据目录: $(pwd)/$PUBLIC_DIR"
else
    echo "部署失败，查看日志："
    docker logs wownav_ts
    exit 1
fi

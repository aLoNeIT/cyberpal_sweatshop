# pi-gateway Dockerfile
# Bun 运行时 + pi-coding-agent CLI
FROM oven/bun:1-alpine

LABEL maintainer="pi-agent team"
LABEL description="pi-agent WebSocket Gateway — Service/Session/Agent 三级隔离"

ARG timezone=Asia/Shanghai

ENV TZ=${timezone} \
    GATEWAY_PORT=3002 \
    GATEWAY_HOST=0.0.0.0 \
    SQLITE_PATH=/data/gateway.db \
    JWT_SECRET="" \
    HEARTBEAT_INTERVAL_MS=10000 \
    HEARTBEAT_TIMEOUT_MS=30000 \
    SESSION_TIMEOUT_MS=1800000 \
    AGENT_IDLE_TIMEOUT_MS=600000 \
    CLEANUP_INTERVAL_MS=60000 \
    REPLAY_SLEEP_MS=10 \
    REPLAY_BATCH_SIZE=100 \
    LOG_LEVEL=info \
    PI_SANDBOX=gondolin \
    PI_PERMISSION_CONFIG=/etc/pi/permission.config.json

# 安装 pi-coding-agent（Node.js 方式，与 Bun 兼容）
RUN apk add --no-cache nodejs npm \
    && npm config set registry https://registry.npmmirror.com \
    && npm install -g --ignore-scripts @earendil-works/pi-coding-agent \
    && apk del npm \
    && rm -rf /var/cache/apk/* /tmp/*

# 创建数据目录
RUN mkdir -p /data /etc/pi

WORKDIR /app

# 复制网关源码
COPY package.json tsconfig.json ./
COPY src/ ./src/
COPY config/ ./config/

# Bun 零外部依赖，无需 bun install
# 但 package.json 中 type: "module" 告诉 Bun 使用 ESM

EXPOSE 3002

# 健康检查
HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
    CMD bun -e "const r=await fetch('http://localhost:3002/health');process.exit(r.status===200?0:1)"

ENTRYPOINT ["bun", "run", "src/server.ts"]

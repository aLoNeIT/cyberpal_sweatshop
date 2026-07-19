# Hyperf + Pi Agent Dockerfile
# 使用 Alpine 3.21 基础镜像，自带 Node.js 22
FROM hyperf/hyperf:8.3-alpine-v3.21-swoole
LABEL maintainer="Hyperf Developers <group@hyperf.io>" version="1.0" license="MIT" app.name="Hyperf"

ARG timezone

ENV TIMEZONE=${timezone:-"Asia/Shanghai"} \
    APP_ENV=dev \
    SCAN_CACHEABLE=false

# Alpine 3.21 自带 Node.js 22，满足 Pi Agent >= 22.19 要求
RUN set -ex \
    && apk add --no-cache nodejs npm \
    && npm config set registry https://registry.npmmirror.com \
    && npm install -g --ignore-scripts @earendil-works/pi-coding-agent \
    && node -v \
    && pi --version \
    && php -v \
    && php --ri swoole \
    && cd /etc/php* \
    && { \
        echo "upload_max_filesize=128M"; \
        echo "post_max_size=128M"; \
        echo "memory_limit=1G"; \
        echo "date.timezone=${TIMEZONE}"; \
    } | tee conf.d/99_overrides.ini \
    && ln -sf /usr/share/zoneinfo/${TIMEZONE} /etc/localtime \
    && echo "${TIMEZONE}" > /etc/timezone \
    && rm -rf /var/cache/apk/* /tmp/* /usr/share/man \
    && echo -e "\033[42;37m Build Completed :).\033[0m\n"

# 预创建 Pi Agent 配置和会话目录
RUN mkdir -p /root/.pi/agent /tmp/pi-sessions

WORKDIR /opt/www

COPY . /opt/www
RUN composer install --no-dev -o

EXPOSE 9502

ENTRYPOINT ["php", "/opt/www/bin/hyperf.php", "start"]

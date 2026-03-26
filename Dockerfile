ARG NGINX_NAME=arm64v8/nginx:alpine
# 使用轻量级的 Nginx 镜像作为基础镜像
FROM ${NGINX_NAME}
LABEL authors="duqian"
# 将空的默认配置文件复制到容器中，替换原有的默认配置
#COPY default.conf /etc/nginx/conf.d/default.conf

# 定义构建参数，默认为 uat
# ARG ENV=nginx

# 将自定义的 Nginx 配置文件复制到容器中
COPY nginx/${ENV:-nginx}.conf /etc/nginx/conf.d/nginx.conf

# 将 Vue 3 项目打包后的 dist 文件夹复制到 Nginx 的默认静态文件目录
COPY dist /usr/share/nginx/html

# 暴露容器的 80 端口
EXPOSE 8081

# 启动 Nginx 服务
CMD ["nginx", "-g", "daemon off;"]

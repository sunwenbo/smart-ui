FROM node:16.20.2 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm config set registry https://registry.npmmirror.com/
RUN npm install  --legacy-peer-deps
COPY . .
RUN npm run build:prod

# production stage
FROM nginx:mainline-alpine3.20
COPY --from=builder /app/dist /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


# 本地如果是arm架构，但是想构建为x86架构的镜像
# docker buildx build --platform linux/amd64 -t registry.cn-beijing.aliyuncs.com/sunwenbo/smart-ui:latest . --load
# docker push registry.cn-beijing.aliyuncs.com/sunwenbo/smart-ui:latest


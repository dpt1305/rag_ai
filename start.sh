#!/bin/bash

# Hiển thị màu sắc cho thông báo
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}>>> Đang cài đặt thư viện...${NC}"
npm install

echo -e "${BLUE}>>> Đang khởi chạy Docker (PostgreSQL + pgvector)...${NC}"
docker compose up -d

# Đợi một chút để Postgres khởi động xong
echo -e "${BLUE}>>> Đang đợi database sẵn sàng...${NC}"
sleep 10

echo -e "${BLUE}>>> Đang đồng bộ database schema với Prisma...${NC}"
npx prisma db push

echo -e "${GREEN}>>> Tất cả đã sẵn sàng! Đang khởi động ứng dụng Nuxt...${NC}"
npm run dev

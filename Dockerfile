# Stage 1: Builder
FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./

# JANGAN jalankan npm install penuh jika internet lambat.
# Tapi kita butuh npm memperbaiki symlink yang rusak dari Mac.
COPY . .

# Tambahkan perintah 'npm rebuild' sebelum build
# Ini jauh lebih cepat daripada 'npm install' karena hanya memperbaiki link
RUN npm rebuild && npm run build
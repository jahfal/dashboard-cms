# Stage 1: Build the CMS application (Builder)
FROM node:18-alpine AS builder

WORKDIR /app

# 1. Copy package files
COPY package*.json ./

# 2. Copy SEMUA file termasuk node_modules hasil SCP dari Mac
# Pastikan .dockerignore tidak mengecualikan node_modules!
COPY . .

# 3. PERBAIKI link binary yang rusak akibat beda OS (Mac ke Linux)
# Perintah ini jauh lebih cepat daripada 'npm install' penuh.
RUN npm rebuild

# 4. Jalankan build (menggunakan node_modules yang sudah diperbaiki)
RUN npm run build


# Stage 2: Create a production-ready image
FROM node:18-alpine

WORKDIR /app

# 5. Install 'serve' untuk menjalankan folder build
# Menggunakan mirror agar tidak timeout di internet Acer (0.73 Mbps)
RUN npm config set registry https://registry.npmmirror.com && \
    npm install -g serve

# 6. Ambil hasil build dari Stage 1
COPY --from=builder /app/build ./build
COPY --from=builder /app/public ./public

# 7. Update URL API agar menunjuk ke Cloudflare Tunnel Anda
# RUN find build -type f -exec sed -i 's|http://localhost:3000/api|https://ever-ease-mixture-app.trycloudflare.com|g' {} +

# Expose port CMS
EXPOSE 3002

# Jalankan aplikasi menggunakan 'serve'
CMD ["serve", "-s", "build", "-l", "3002"]
# Stage 1: Build the CMS application (Builder)
FROM node:18-alpine AS builder

WORKDIR /app

# Ambil package files
COPY package*.json ./

# Masukkan node_modules 233MB dan kodingan
COPY . .

# Perbaiki binary link (Sangat Cepat) & Build kodingan
RUN npm rebuild && npm run build

# --- TAMBAHAN: Install serve di sini agar aman ---
RUN npm install -g serve --registry=https://registry.npmmirror.com


# Stage 2: Production Image
FROM node:18-alpine

WORKDIR /app

# Ambil 'serve' yang sudah diinstall di Stage 1
COPY --from=builder /usr/local/bin/serve /usr/local/bin/serve
COPY --from=builder /usr/local/lib/node_modules /usr/local/lib/node_modules

# Ambil hasil build
COPY --from=builder /app/build ./build
COPY --from=builder /app/public ./public

# AKTIFKAN LAGI INI (Hapus tanda #) agar API jalan di Cloudflare
RUN find build -type f -exec sed -i 's|http://localhost:3000/api|https://ever-ease-mixture-app.trycloudflare.com|g' {} +

EXPOSE 3002

CMD ["serve", "-s", "build", "-l", "3002"]
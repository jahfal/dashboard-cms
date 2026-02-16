# Stage 1: Build the CMS application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json
COPY package*.json ./

# --- MODIFIKASI DISINI (Stage 1) ---
# Tambahkan timeout, retries, dan mirror agar download lebih stabil
# RUN npm config set registry https://registry.npmmirror.com && \
#     npm config set fetch-retry-maxtimeout 60000000 && \
#     npm config set fetch-retries 10 && \
#     npm install --legacy-peer-deps --no-audit --no-fund

# Copy the rest of the application code
COPY . .

# Run the build command
RUN npm run build

# Stage 2: Create a production-ready image
FROM node:18-alpine

WORKDIR /app

# Copy package.json
COPY package*.json ./

# --- MODIFIKASI DISINI (Stage 2) ---
# Tetap gunakan legacy-peer-deps agar instalasi dependencies inti tidak konflik
# RUN npm config set registry https://registry.npmmirror.com && \
#     npm config set fetch-retry-maxtimeout 60000000 && \
#     npm config set fetch-retries 10 && \
#     npm install --omit=dev --legacy-peer-deps --no-audit

RUN npm install -g serve --registry=https://registry.npmmirror.com

# Copy the 'build' folder dari builder stage
COPY --from=builder /app/build ./build
COPY --from=builder /app/public ./public

# RUN find build -type f -exec sed -i 's|http://localhost:3000/api|https://ever-ease-mixture-app.trycloudflare.com|g' {} +

# Expose the port the CMS runs on
EXPOSE 3002

# --- MODIFIKASI DISINI (Global Install) ---
# Gunakan mirror juga saat menginstall 'serve' agar cepat
CMD ["serve", "-s", "build", "-l", "3002"]
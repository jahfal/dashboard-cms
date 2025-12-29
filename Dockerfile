# Stage 1: Build the CMS application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./

# MODIFIKASI DISINI: Tambahkan timeout dan legacy-peer-deps
RUN npm config set fetch-retry-maxtimeout 600000 && \
    npm config set fetch-retries 5 && \
    npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Run the build command
RUN npm run build

# Stage 2: Create a production-ready image
FROM node:18-alpine

WORKDIR /app

# Copy package.json and install production-only dependencies
COPY package*.json ./

# MODIFIKASI DISINI: Tambahkan legacy-peer-deps juga agar tidak error saat install serve
RUN npm config set fetch-retry-maxtimeout 600000 && \
    npm config set fetch-retries 5 && \
    RUN npm install --omit=dev --legacy-peer-deps

# Corrected: Copy the 'build' folder instead of '.next'
COPY --from=builder /app/build ./build
COPY --from=builder /app/public ./public

# Expose the port the CMS runs on
EXPOSE 3002

# Define the command to start the production server
# Gunakan --legacy-peer-deps juga saat install global package jika perlu
RUN npm install -g serve --legacy-peer-deps
CMD ["serve", "-s", "build", "-l", "3002"]
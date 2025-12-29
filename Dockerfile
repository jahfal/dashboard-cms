# Stage 1: Build the CMS application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Run the build command
RUN npm run build

# Stage 2: Create a production-ready image
FROM node:18-alpine

WORKDIR /app

# Copy package.json and install production-only dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Corrected: Copy the 'build' folder instead of '.next'
COPY --from=builder /app/build ./build
COPY --from=builder /app/public ./public

# Expose the port the CMS runs on
EXPOSE 3002

# Define the command to start the production server
# You'll need to use a static server like 'serve' to run this build
# The first command installs 'serve', the second one actually runs it
RUN npm install -g serve
CMD ["serve", "-s", "build", "-l", "3002"]

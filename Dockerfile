# Build stage for React frontend
FROM node:18 AS builder
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (including dev)
RUN npm install

# Copy source
COPY vite.config.js tailwind.config.js postcss.config.js index.html ./
COPY src ./src
COPY public ./public-src

# Build React app
RUN npm run build

# Production stage
FROM node:18
WORKDIR /app

# Copy package for backend
COPY package.json package-lock.json* ./

# Install production dependencies only
RUN npm install --production

# Copy backend
COPY server.js .

# Copy built frontend from builder
COPY --from=builder /app/dist ./public

EXPOSE 5000
CMD ["node", "server.js"]


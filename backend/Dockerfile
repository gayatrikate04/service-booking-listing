# Railway can deploy from a Dockerfile or directly from Node.js.
# We use Dockerfile for explicit control over Node version and build steps.

FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files first (Docker layer caching — only reinstalls when package.json changes)
COPY package*.json ./

# Install production dependencies only
# npm ci is deterministic — uses package-lock.json exactly, no version drift
RUN npm ci --only=production

# Copy source code
COPY src ./src
COPY knexfile.js ./

# Never run as root in production containers
# node user already exists in the node:alpine image
USER node

# Expose the port Railway will map to
EXPOSE 3001

# Health check — Docker/Railway pings this to verify container health
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3001/health || exit 1

# Start the server
CMD ["node", "src/server.js"]
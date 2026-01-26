FROM node:18-alpine

WORKDIR /app/server

# Copy server package files
COPY server/package*.json ./

# Install dependencies
RUN npm ci

# Copy server source code
COPY server/ .

# Build
RUN npm run build

# Expose port (Railway assigns PORT env var)
EXPOSE 3005

# Start server
CMD ["npm", "start"]

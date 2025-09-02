# Use Node.js 18 LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install --production

# Copy worker files
COPY job-processor.ts ./
COPY job-processor.js ./

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S reviewrepl -u 1001

# Change ownership of app directory
RUN chown -R reviewrepl:nodejs /app
USER reviewrepl

# Expose port (not needed for background worker, but good practice)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "console.log('Worker is running')" || exit 1

# Start the worker
CMD ["npm", "start"]

# Use a lightweight Node.js image
FROM node:18-alpine

# Install curl for healthcheck
RUN apk add --no-cache curl

# Add a non-root user
RUN addgroup app && adduser -S -G app app

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies and Fastify CLI globally
RUN npm install && npm install -g fastify-cli

# Copy the rest of the application
COPY . .

# Switch to non-root user
USER app

# Expose port
EXPOSE 4000

# Start the application
CMD ["npm", "start"]
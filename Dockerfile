# Use official lightweight Node.js 20 Alpine base image
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package files first to leverage Docker layer caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Ensure app directory is owned by non-root node user
RUN chown -R node:node /app

# Switch to non-root user for security best practices
USER node

# Expose port 3000
EXPOSE 3000

# Set default command to start application
CMD ["npm", "start"]

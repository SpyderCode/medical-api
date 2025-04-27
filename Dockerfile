FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app source code
COPY . .

# Expose API port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production

# Run the app
CMD ["node", "src/index.js"]
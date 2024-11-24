
# Dockerfile for Node.js application
FROM node:16

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install
# Install MySQL client for debugging
RUN apt-get update && apt-get install -y mysql-client
# Copy the rest of the application code
COPY . .

# Expose the port
EXPOSE 3000

# Start the application
CMD ["node", "main.js"]

# Dockerfile for Node.js application
FROM node:16

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Install MySQL client
RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y mysql-client \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy the rest of the application code
COPY . .

# Expose the port
EXPOSE 3000

# Start the application
CMD ["node", "main.js"]
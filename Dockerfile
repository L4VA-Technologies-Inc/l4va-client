FROM node:18-alpine

WORKDIR /app

# First, copy only package files to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Then copy your source code
COPY . .

# Build the application
RUN npm run build

# Remove development dependencies
RUN npm prune --production

EXPOSE 3000

# Make sure the command matches your package.json script
CMD ["npm", "run", "start:prod"]

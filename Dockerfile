# Build stage
FROM node:20-alpine as build

WORKDIR /app

COPY package.json yarn.lock ./
# Use yarn for reproducible builds in Docker
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

# Production stage
FROM nginx:alpine

# Create SSL directory
RUN mkdir -p /etc/nginx/ssl

# Copy SSL certificates
COPY ./ssl/cert.crt /etc/nginx/ssl/
COPY ./ssl/private.key /etc/nginx/ssl/

# Copy built app and nginx conf
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
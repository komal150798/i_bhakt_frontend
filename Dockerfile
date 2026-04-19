FROM node:18-alpine AS builder

WORKDIR /app

# Build arguments for Vite env vars (baked in at build time)
ARG VITE_BACKEND_URL=https://ibhakt.com/backend-api
ARG VITE_API_URL=https://ibhakt.com/backend-api/api/v1
ARG VITE_GOOGLE_CLIENT_ID=817437277788-9c8t12ed24rp6egolaj2n71svj4egdl2.apps.googleusercontent.com

ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build for production
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]


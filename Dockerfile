# Dockerfile (at the root of your repository)
# Stage 1: Build the React Frontend
FROM node:20-alpine AS react-builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

RUN echo "VITE_REACT_APP_API_URL=https://minwebback-343717256329.us-central1.run.app" > .env && \
    cat .env && \
    echo "DEBUG: .env file created with hardcoded VITE_REACT_APP_API_URL."

RUN npm run build

# Stage 2: Serve the Static React App with Nginx
FROM nginx:alpine

RUN apk add --no-cache gettext

COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# --- CHANGED LINE HERE: COPY to a new directory ---
COPY --from=react-builder /app/dist /usr/share/my-react-app
# --- END CHANGED LINE ---

ENV PORT 8080
EXPOSE 8080

CMD ["/bin/sh", "-c", "envsubst '$PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
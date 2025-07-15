# Dockerfile (at the root of your repository)
# Stage 1: Build the React Frontend
FROM node:20-alpine AS react-builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first for caching
COPY package.json package-lock.json ./

RUN npm install

# Copy the rest of your React application files, including the 'src' folder.
COPY . .

# --- IMPORTANT: HARDCODE BACKEND URL FOR BUILD ---
# Replace with your actual deployed minwebback Cloud Run URL
RUN echo "VITE_REACT_APP_API_URL=https://minwebback-343717256329.us-central1.run.app" > .env && \
    cat .env && \
    echo "DEBUG: .env file created with hardcoded VITE_REACT_APP_API_URL."
# --- END IMPORTANT ---

# Run the build command for your Vite React app.
RUN npm run build

# Stage 2: Serve the Static React App with Nginx
FROM nginx:alpine

# --- DIAGNOSTIC STEPS (TEMPORARY - REMOVE AFTER FIX) ---
# Add these lines immediately after "FROM nginx:alpine"
RUN ls -la /usr/share/nginx/
RUN ls -la /usr/share/nginx/html
# --- END DIAGNOSTIC ---


RUN apk add --no-cache gettext
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# --- NEW LINE: EXPLICITLY CREATE THE DESTINATION DIRECTORY (VERY DEFENSIVE) ---
RUN mkdir -p /usr/share/nginx/html
# --- END NEW LINE ---

    
COPY --from=react-builder /app/dist /usr/share/nginx/html # This path is typically correct for Vite

ENV PORT 8080

CMD ["/bin/sh", "-c", "envsubst '$PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]

EXPOSE 8080
FROM ghcr.io/puppeteer/puppeteer:20.1.1
USER root
WORKDIR /app
COPY . .
RUN apt update && \
    # install ffmpeg for video and GIF support
    apt install ffmpeg -y && \
    npm install
ENV NODE_ENV=production
CMD ["node", "app.js"]
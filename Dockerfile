FROM ghcr.io/puppeteer/puppeteer:19.8.1
USER root
WORKDIR /app
COPY . .
RUN npm install
ENV NODE_ENV=production
CMD ["node", "app.js"]
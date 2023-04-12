FROM ghcr.io/puppeteer/puppeteer:19.8.5
USER root
WORKDIR /app
COPY . .
RUN npm install && \
    # replace "window.mR.findModule('promoteParticipants')[1];" with "window.mR.findModule('promoteParticipants')[0];" in node_modules/whatsapp-web.js/src/util/Injected.js (temporary fix until maintainer merges PR)
    # https://dwaves.de/tools/escape/
    sed -i 's/window\.Store\.GroupParticipants = window\.mR\.findModule(\x27promoteParticipants\x27)\[1\];/window\.Store\.GroupParticipants = window\.mR\.findModule(\x27promoteParticipants\x27)\[0\];/g' node_modules/whatsapp-web.js/src/util/Injected.js
ENV NODE_ENV=production
CMD ["node", "app.js"]
const { importModules } = require('./utils');

const handlerDir = './keyword_handlers/';

const handlers = importModules(handlerDir);

if (Object.keys(handlers).length > 0) {
    console.log(`Loaded ${Object.keys(handlers).length} keyword handlers:`);
    for (const handler of Object.keys(handlers)) {
        console.log(`- ${handler}`);
    }
} else {
    console.log('No keyword handlers found.');
}

async function keywordsHandler(client, message) {
    for (const handler of Object.keys(handlers)) {
        const matches = Array.from(message.body.matchAll(handlers[handler].REGEX)).map(match => match[0])
        if (matches.length) {
            await handlers[handler].handler(client, message, matches);
        }
    }
}

module.exports = {
    keywordsHandler: keywordsHandler
};
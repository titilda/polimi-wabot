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
        const matches = message.body.match(handlers[handler].REGEX);
        if (matches) {
            await handlers[handler].handler(client, message, matches);
        }
    }
}

module.exports = {
    keywordsHandler: keywordsHandler
};
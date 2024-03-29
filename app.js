const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');

const constants = require('./constants.js');
const { getRandomJoinMessage } = require('./join_messages.js');
const { nconf, getBrowserPath } = require('./config.js');
const { Handlers } = require('./dispatchers.js');
const { WebAPI } = require('./web_api.js');

var wwversion

var client = new Client({
    authStrategy: new LocalAuth(
        options = {
            dataPath: './data/.wwebjs_auth/',
        }),
    webVersion: '2.2350.52',
    puppeteer: {
        headless: true,
        executablePath: getBrowserPath(),
        args: ['--no-sandbox'],
    }
});

const handlers = new Handlers();

client.library = require('whatsapp-web.js') // this is a hack to make the WWebJS library available to the commands

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

function messageFilter(message) {
    if (message.type !== 'chat') {
        console.log(`Message of type ${message.type} from ${message.from} filtered out`);
        return false;
    };
    if (Object.keys(nconf.get("CHAT_WHITELIST")).length === 0) {
        return true
    }
    else {
        if (nconf.get("CHAT_WHITELIST").includes(message.from)) {
            return true;
        }
        else {
            console.log(`Message from ${message.from} filtered out`);
            return false;
        };
    };
};

async function errorHandler(error) {
    const timestamp = new Date().toISOString()
    console.log(`++++++++++++++ USER ENCOUNTERED ERROR AT ${timestamp}: ++++++++++++++\n${error}`);
}

async function logMessage(message) {
    const contact = await message.getContact();
    const chat = await message.getChat();
    console.log(`${new Date().toISOString()} ${contact.pushname} (${contact.id.user} @ ${message.from}): ${message.body}`);
};

async function onMessage(message) {
    if (messageFilter(message)) {
        await logMessage(message);
        if (message.body.trim().startsWith(nconf.get("COMMAND_PREFIX"))) {
            const slices = message.body.replace(/\s+/g, " ").trim().split(' ');
            const command = slices[0].slice(1);
            const args = slices.slice(1);
            handlers.commandDispatcher(client, message, command, args, nconf).catch(errorHandler);
        }
        else
            handlers.keywordDispatcher(client, message, nconf).catch(errorHandler);
    }
}

async function onGroupJoin(groupNotification) {
    const chat = await groupNotification.getChat();
    const participant = groupNotification.id.participant;
    const chat_id = chat.id._serialized;
    if (nconf.get("CHAT_WHITELIST").includes(chat_id)) {
        const replyMessage = `${getRandomJoinMessage()}\n\nCiao @${participant.split('@')[0]} 👋, benvenutə in ${chat.name}!`
        const mentions = { id: { _serialized: participant } };
        await groupNotification.reply(replyMessage, { mentions: [mentions] });
    }
    await chat.sendMessage();
};

client.on('message', onMessage);

client.on('group_join', onGroupJoin)

// TO BE IMPLEMENTED: reaction handler
// client.on('message_reaction', console.log)

client.on('disconnected', () => {
    console.log('Disconnected!');
});

client.initialize()
    .then(
        async () => {
            wwversion = await client.getWWebVersion()
            console.log(`\n${constants.SPLASH}\n\nWhatsApp Web Version: ${wwversion}\nServer time: ${new Date().toISOString()}`)
        })
    .then(() => new WebAPI(client, nconf)
    );
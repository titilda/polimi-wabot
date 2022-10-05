const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const { commandDispatcher } = require('./commands.js');
const { getRandomJoinMessage } = require('./join_messages.js');
const { keywordsHandler } = require('./keywords.js')
const { nconf } = require('./config.js');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox'],
    }
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.initialize();

async function logMessage(message) {
    const contact = await message.getContact();
    const chat = await message.getChat();
    console.log(`${new Date().toISOString()} ${contact.pushname} (${contact.id.user} @ ${message.from}): ${message.body}`);
};

function messageFilter(message) {
    if (message.type !== 'chat') {
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

async function onMessage(message) {
    if (messageFilter(message)) {
        await logMessage(message);
        const contact = await message.getContact();
        const chat = await message.getChat();

        if (message.body.trim().startsWith(nconf.get("COMMAND_PREFIX"))) {
            const command = message.body.trim().split(' ')[0].slice(1);
            const args = message.body.trim().split(' ').slice(1);
            try {
                await commandDispatcher(client, message, command, args);
            }
            catch (error) {
                console.log(error);
                message.reply(`Siamo spiacenti, si è verificato un errore interno del server. Riprova più tardi.\n${new Date().toISOString()}`);
            };
        }
        else {
            keywordsHandler(client, message);
        };
    };
};

async function onGroupJoin(groupNotification) {
    const chat = await groupNotification.getChat();
    const participant = groupNotification.id.participant;
    const chat_id = chat.id._serialized;
    if (nconf.get("CHAT_WHITELIST").includes(chat_id)) {
        const replyMessage = `${getRandomJoinMessage()}\n\nCiao @${participant.split('@')[0]} 👋, benvenutə in ${chat.name}! ${nconf.get("DISCORD_URL")} è il nostro server Discord.\n⚠️ Questo bot, così come il server Discord, non è ufficiale e non è affiliato ad alcuna organizzazione, inclusa PoliNetwork.`
        const mentions = { id: { _serialized: participant } };
        await groupNotification.reply(replyMessage, { mentions: [mentions] });
    }
    await chat.sendMessage();
};

client.on('message', onMessage);

client.on('group_join', onGroupJoin)

client.on('disconnected', () => {
    console.log('Disconnected!');
});
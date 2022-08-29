const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const { commandDispatcher } = require('./commands.js');
const { nconf } = require('./config.js');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: false
    }
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.initialize();

const KEYWORD_REGEXES = {
    'arancina': /arancina/i,
    'arancino': /arancino/i,
    'terrone': /terron[e|i|a]/i,
}

async function logMessage(message) {
    const contact = await message.getContact();
    const chat = await message.getChat();
    console.log(`${contact.pushname} (${contact.id.user} @ ${message.from}): ${message.body}`);
}

async function onMessage(message) {
    if (nconf.get("CHAT_WHITELIST").includes(message.from) && message.type === 'chat') {
        await logMessage(message);
        const contact = await message.getContact();
        const chat = await message.getChat();

        if (message.body.trim().startsWith(nconf.get("COMMAND_PREFIX"))) {
            const command = message.body.trim().split(' ')[0].slice(1);
            const args = message.body.trim().split(' ').slice(1);
            await commandDispatcher(message, command, args);
        }
        else {
            let keywordsFound = []
            for (let keyword in KEYWORD_REGEXES) {
                if (KEYWORD_REGEXES[keyword].test(message.body)) {
                    keywordsFound.push(keyword);
                };
            };
            if (keywordsFound.length > 0) {
                let arancinNum = 0;
                if (keywordsFound.includes('arancino')) {
                    arancinNum += 1;
                }
                if (keywordsFound.includes('arancina')) {
                    arancinNum += 2;
                }
                switch (arancinNum) {
                    case 0:
                        break;
                    case 1:
                        await chat.sendMessage(`Sorry, @${contact.id.user}, the correct spelling is: arancina`, {
                            mentions: [contact],
                            quotedMessageId: message.id._serialized
                        });
                        break;
                    case 2:
                        await chat.sendMessage(`Sorry, @${contact.id.user}, the correct spelling is: arancino`, {
                            mentions: [contact],
                            quotedMessageId: message.id._serialized
                        });
                        break;
                    case 3:
                        await chat.sendMessage(`Sorry, @${contact.id.user}, the correct spelling is: arancinə`, {
                            mentions: [contact],
                            quotedMessageId: message.id._serialized
                        });
                        break;
                };
            };
        };
    };
};

async function onGroupJoin(groupNotification) {
    const chat = await groupNotification.getChat();
    const participant = groupNotification.id.participant;
    const chat_id = chat.id._serialized;
    if (nconf.get("GROUP_WHITELIST").includes(chat_id)) {
        console.log(`${participant} joined ${chat_id}`);
        let replyMessage = `Ciao @${participant.split('@')[0]} 👋, benvenutə in ${chat.name}! Scrivi ${nconf.get("COMMAND_PREFIX")}discord per ricevere il link al nostro server di Discord.\n⚠️ Questo bot, così come il server Discord, non è ufficiale e non è affiliato ad alcuna organizzazione.`
    }
    await chat.sendMessage();
}

client.on('message', onMessage);

client.on('group_join', onGroupJoin)

client.on('disconnected', () => {
    console.log('Disconnected!');
});
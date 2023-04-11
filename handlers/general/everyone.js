const { getRateLimit } = require('../../timestamp.js');
const { contactBotAdminCheck } = require("../../utils.js");

const commands = {
    everyone: {
        description: "Pinga tutti i partecipanti della chat",
        syntax: "everyone",
        handler: async (client, message, args, nconf) => {
            const chat = await message.getChat()
            if (!chat.isGroup) {
                message.reply("Questo comando è disponibile solo in chat di gruppo");
                return;
            }
            const chat_id = chat.id._serialized;
            const participants = chat.participants;

            // check if chat has /everyone ratelimited
            if (getRateLimit("everyone", chat_id, nconf.get("RATE_LIMIT_EVERYONE"))) {
                if (!await message.getContact().then(contact => contactBotAdminCheck(contact, nconf))) {
                    await message.reply(`Mi spiace, si può usare il comando solo ogni ${nconf.get("RATE_LIMIT_EVERYONE")} secondi`);
                    return;
                }
            }

            let toPing = {};
            for (let participant of participants) {
                if (participant.id.user != client.info.wid.user) {
                    toPing[participant.id.user] = await client.getContactById(participant.id.user + "@c.us");
                };
            }
            if (Object.keys(toPing).length > 0) {
                replyMessage = `Pingo tutti:\n${Object.keys(toPing).map(i => '@' + i).join(' ')}`;
                const quotedMessage = await message.getQuotedMessage();
                let replyOptions;
                if (quotedMessage === undefined) {
                    replyOptions = { mentions: Object.keys(toPing).map(key => toPing[key]) };
                    await message.reply(replyMessage, null, replyOptions);
                }
                else {
                    replyOptions = { mentions: Object.keys(toPing).map(key => toPing[key]), quotedMessageId: quotedMessage.id._serialized };
                    await chat.sendMessage(replyMessage, replyOptions);
                };
            }
            else {
                await message.reply("Non ci sono utenti da pingare");
            }
        }
    }
};

module.exports = {
    commands: commands
};
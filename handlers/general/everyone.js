const { getRateLimit } = require('../../timestamp.js');

const commands = {
    everyone: {
        description: "Pinga tutti i partecipanti della chat",
        syntax: "everyone",
        handler: async (client, message, args, nconf) => {
            const chat = await message.getChat()
            const chat_id = chat.id._serialized;
            const quotedMessage = await message.getQuotedMessage();
            const participants = chat.participants;
            const contact = await message.getContact();

            // check if the user is a dumbass
            if (nconf.get("BLACKLIST").includes(contact.id.user)) {
                await message.reply("Mi spiace, ma visto che fai il pirla non ti affiderei manco le mie piante");
                return;
            }

            // check if chat has /everyone ratelimited
            if (getRateLimit("everyone", chat_id, nconf.get("RATE_LIMIT_EVERYONE"))) {
                await message.reply(`Mi spiace, si può usare il comando solo ogni ${nconf.get("RATE_LIMIT_EVERYONE")} secondi`);
                return;
            }

            let pingDict = {};
            for (let participant of participants) {
                if (participant.id.user != client.info.wid._serialized.split("@")[0]) {
                    pingDict[participant.id.user] = await client.getContactById(participant.id.user + "@c.us");
                };
            }
            if (Object.keys(pingDict).length > 0) {
                replyMessage = `Pingo tutti:\n${Object.keys(pingDict).map(i => '@' + i).join(' ')}`;
                if (quotedMessage === undefined) {
                    var replyOptions = { mentions: Object.keys(pingDict).map(key => pingDict[key]) };
                    await message.reply(replyMessage, null, replyOptions);
                }
                else {
                    var replyOptions = { mentions: Object.keys(pingDict).map(key => pingDict[key]), quotedMessageId: quotedMessage.id._serialized };
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
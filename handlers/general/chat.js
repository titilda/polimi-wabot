const { contactBotAdminCheck } = require('../../utils.js');

const commands = {
    chatinfo: {
        description: 'Mostra informazioni sulla chat',
        syntax: 'chatinfo [chatID]',
        handler: async (client, message, args, nconf) => {
            chat = args[0] === undefined ? await message.getChat() : await client.getChatById(args[0]);
            var response = `Nome chat: ${chat.name}\nChat ID: ${chat.id._serialized}\nChat è un gruppo: ${chat.isGroup ? "sì" : "no"}`;
            if (chat.isGroup) {
                response += `\nNumero di membri: ${chat.participants.length} (incluso il bot)`
            };
            await message.reply(response);
        }
    },
    allchatsinfo: {
        description: 'Mostra informazioni su tutti i gruppi',
        syntax: 'allchatsinfo',
        handler: async (client, message, args, nconf) => {
            if (!(await contactBotAdminCheck(await message.getContact(), nconf))) {
                await message.reply("Non hai i permessi per usare questo comando");
                return;
            }
            // get chats where isGroup is true
            let allChats = await client.getChats()
            let groupChats = allChats.filter(chat => chat.isGroup)
            if (allChats.length === 0) {
                await message.reply("Il bot non è in nessun gruppo");
                return;
            }
            var response = "Elenco dei gruppi:\n";
            for (const chat of groupChats) {
                response += `• ${chat.name} (ID: ${chat.id._serialized})\n`;
            };
            await message.reply(response);
        }
    },
    whitelistchat: {
        description: 'Aggiunge una chat alla whitelist',
        syntax: 'whitelistchat <chatID|@mention>',
        handler: async (client, message, args, nconf) => {
            if (!(await contactBotAdminCheck(await message.getContact(), nconf))) {
                await message.reply("Non hai i permessi per usare questo comando");
                return;
            }
            if (args.length !== 1) {
                await message.reply("Sintassi: " + nconf.get("COMMAND_PREFIX") + "whitelistchat <chatID|@mention>");
                return;
            }
            let chatID = args[0];
            if (chatID[0] === "@") {
                chatID = chatID.slice(1) + "@c.us";
            }
            let chat = await client.getChatById(chatID);
            if (chat === undefined) {
                await message.reply("Chat non trovata");
                return;
            }
            let whitelist = nconf.get("CHAT_WHITELIST");
            if (whitelist.includes(chatID)) {
                await message.reply("Chat già in whitelist");
                return;
            }
            whitelist.push(chatID);
            nconf.save();
            message.reply("Chat aggiunta alla whitelist!");
        }
    },
    unwhitelistchat: {
        description: 'Rimuove una chat dalla whitelist',
        syntax: 'unwhitelistchat <chatID|@mention>',
        handler: async (client, message, args, nconf) => {
            if (!(await contactBotAdminCheck(await message.getContact(), nconf))) {
                await message.reply("Non hai i permessi per usare questo comando");
                return;
            }
            if (args.length !== 1) {
                await message.reply("Sintassi: " + nconf.get("COMMAND_PREFIX") + "unwhitelistchat <chatID|@mention>");
                return;
            }
            let chatID = args[0];
            if (chatID[0] === "@") {
                chatID = chatID.slice(1) + "@c.us";
            }
            let chat = await client.getChatById(chatID);
            if (chat === undefined) {
                await message.reply("Chat non trovata");
                return;
            }
            let whitelist = nconf.get("CHAT_WHITELIST");
            if (!whitelist.includes(chatID)) {
                await message.reply("Chat non in whitelist");
                return;
            }
            whitelist.splice(whitelist.indexOf(chatID), 1);
            nconf.save();
            message.reply("Chat rimossa dalla whitelist!");
        }
    }
};

module.exports = {
    commands: commands
};
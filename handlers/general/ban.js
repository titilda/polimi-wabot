const { contactGroupAdminCheck } = require('../../utils.js');

const commands = {
    ban: {
        description: "Banna un utente dal gruppo (puoi citare il messaggio dell'utente o @menzionarlo)",
        syntax: "ban [@utente]",
        handler: async (client, message, args, nconf) => {
            let chat = await message.getChat();
            let myWid = client.info.wid;
            let banner = await message.getContact();
            let quotedMessage;
            let bannee;

            switch (args.length) {
                case 0:
                    quotedMessage = await message.getQuotedMessage();
                    if (quotedMessage === undefined) {
                        await message.reply(`Scrivi ${nconf.get("COMMAND_PREFIX")}ban <@utente> per bannare un utente`);
                        return;
                    }
                    else {
                        quotedMessage = await message.getQuotedMessage();
                        bannee = await quotedMessage.getContact();
                        break;
                    }
                case 1:
                    if (args[0].startsWith("@")) {
                        bannee = await client.getContactById(args[0].substring(1) + "@c.us");
                    }
                    else {
                        await message.reply(`Scrivi ${nconf.get("COMMAND_PREFIX")}ban <@utente> per bannare un utente`);
                    }
                    break;
                default:
                    await message.reply(`Puoi bannare solo un utente alla volta`);
                    return;
            }

            // check if the banned user is the bot
            if (bannee.id._serialized == myWid._serialized) {
                await message.reply("Non puoi bannare il bot");
                return;
            }

            // check if the bot has the permission to ban
            if (!contactGroupAdminCheck(myWid._serialized, chat)) {
                await message.reply("Non ho i permessi per bannare");
                return;
            }

            // check if the banner has the permission to ban
            if (!contactGroupAdminCheck(banner.id._serialized, chat)) {
                await message.reply("Non hai i permessi per bannare");
                return;
            }

            // check if the bannee is an admin and if he is in the group (throws ReferenceError if not in the group)
            try {
                if (await contactGroupAdminCheck(bannee.id._serialized, chat)) {
                    await message.reply("Non puoi bannare un admin");
                    return;
                }
            } catch (error) {
                if (error == ReferenceError) {
                    await message.reply("L'utente non è nel gruppo");
                } else {
                    console.log(error);
                    throw error;
                }
                return;
            }

            // ban the user
            await chat.removeParticipants([bannee.id._serialized]);
        }
    }
};

module.exports = {
    commands: commands
};
const { SUPPORTED_MIME_TYPES } = require("./constants.js")
// const { contactGroupAdminCheck } = require("../../utils.js")

const VIEW_ONLY_ONCE_MSG = "Devi rispondere ad un messaggio con un'immagine visibile una sola volta!";
const VIEW_ONLY_ONCE_FORMAT_MSG = "Devi rispondere ad un messaggio con un'immagine visibile una sola volta in formato JPEG o PNG!";
const SAVED_REACTION_EMOJI = "💾";

const commands = {
    "save": {
        description: "Salva un'immagine visibile \"una sola volta\". I partecipanti della chat potranno vedere che l'immagine è stata salvata.",
        syntax: "save",
        handler: async (client, message, args, nconf) => {
            const mediaMessage = await message.getQuotedMessage()
            let media;
            try {
                media = await mediaMessage.downloadMedia();
            }
            catch (err) {
                await message.reply(VIEW_ONLY_ONCE_MSG);
                return;
            }
            if (!SUPPORTED_MIME_TYPES.includes(media.mimetype)) {
                await message.reply(VIEW_ONLY_ONCE_FORMAT_MSG);
                return;
            }
            if (!mediaMessage._data.isViewOnce) {
                await message.reply(VIEW_ONLY_ONCE_MSG);
                return;
            }

            const sourceChat = await message.getChat();
            await mediaMessage.react(SAVED_REACTION_EMOJI);

            // send the image to the user
            await message.getContact()
                .then(async targetContact => targetContact.getChat())
                .then(async targetChat => mediaMessage.reply(
                    media,
                    targetChat.id._serialized,
                    { caption: `Immagine salvata da \`\`\`${sourceChat.name}\`\`\`` }
                ));


            // WA still shows the author of deleted messages, so this is pretty pointless
            // if (await contactGroupAdminCheck(client.info.wid._serialized, sourceChat)) {
            //     await message.delete(true /* true means delete for everyone */);
            // }

        }
    }
};

module.exports = {
    commands: commands,
};
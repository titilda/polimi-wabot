const { SUPPORTED_MIME_TYPES } = require("./constants.js")
// const { contactGroupAdminCheck } = require("../../utils.js")

const VIEW_ONLY_ONCE_MSG = "Devi rispondere ad un messaggio con un media visibile una sola volta!";
const VIEW_ONLY_ONCE_FORMAT_MSG = "Devi rispondere ad un messaggio con una foto o video!";
const NO_LONGER_AVAILABLE_MSG = "Siamo spiacenti, questo messaggio non è più disponibile su WhatsApp e non può essere salvato.\nLe immagini visibili una sola volta vengono eliminate dal server entro 14 giorni, e i video potrebbero essere rimossi dopo un solo download.";
const SAVED_REACTION_EMOJI = "💾";
const CONFIRMATION_REACTION_EMOJI = "✅";

const commands = {
    "save": {
        description: "Salva un contenuto multimediale visibile \"una sola volta\". I partecipanti della chat potranno vedere che l'immagine è stata salvata.",
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
            if (typeof media == "undefined") { // view-once media expires after 14 days, as per https://faq.whatsapp.com/1077018839582332
                await message.reply(NO_LONGER_AVAILABLE_MSG);
                return;
            }
            if (!SUPPORTED_MIME_TYPES.includes(media.mimetype)) {
                console.log(`Unsupported MIME type: ${media.mimetype}`);
                await message.reply(VIEW_ONLY_ONCE_FORMAT_MSG);
                return;
            }
            if (!mediaMessage._data.isViewOnce) {
                await message.reply(VIEW_ONLY_ONCE_MSG);
                return;
            }

            const sourceChat = await message.getChat();
            // send the image to the user
            await message.getContact()
                .then(async targetContact => targetContact.getChat())
                .then(async targetChat => mediaMessage.reply(
                    media,
                    targetChat.id._serialized,
                    { caption: `Contenuto salvato da \`\`\`${sourceChat.name}\`\`\`` + (typeof mediaMessage._data.caption !== "undefined" ? `\n\nDidascalia:\n\`\`\`${mediaMessage._data.caption}\`\`\`` : "") }
                ));

            await mediaMessage.react(SAVED_REACTION_EMOJI);
            await message.react(CONFIRMATION_REACTION_EMOJI);

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
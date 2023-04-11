const { SUPPORTED_MIME_TYPES } = require("./constants.js")

const commands = {
    "stickerthis": {
        description: "Crea uno sticker da un'immagine",
        syntax: "stickerthis [(a capo) autore] [(a capo) nome del pacchetto]",
        handler: async (client, message, args, nconf) => {
            const mediaMessage = await message.getQuotedMessage()
            let media;
            try {
                media = await mediaMessage.downloadMedia();
            }
            catch (err) {
                await message.reply("Devi rispondere ad un messaggio con un'immagine!");
                return;
            }
            if (!SUPPORTED_MIME_TYPES.includes(media.mimetype)) {
                await message.reply("Devi rispondere ad un messaggio con un'immagine in formato JPEG o PNG!");
                return;
            }
            if (mediaMessage._data.isViewOnce) {
                await message.reply("Non puoi creare uno sticker da un'immagine visibile una sola volta 👀")
                return;
            }

            chat = await message.getChat();

            followingLines = message.body.split("\n", 3).slice(1);
            stickerAuthor = (followingLines[0] !== undefined && followingLines[0].trim().length > 0) ? followingLines[0] : "titilda";
            stickerName = (followingLines[1] !== undefined && followingLines[1].trim().length > 0) ? followingLines[1] : "polimi-wabot";

            chat.sendMessage(media, { sendMediaAsSticker: true, stickerAuthor: stickerAuthor, stickerName: stickerName });
        }
    }
};

module.exports = {
    commands: commands
};
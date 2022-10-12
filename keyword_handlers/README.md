# Keyword Handlers

In questa directory, inserire moduli `handler_XXXXX.js` che esportano una costante `REGEX` con una regex contenente le parole chiave da matchare e una funzione `handler` che attende i seguenti argomenti:

 1. il client di WhatsApp Web (`WAWebJS.Client`)
 2. il messaggio da elaborare (`WAWebJS.Message`)
 3. un array contenente i match del regex come stringhe

La funzione deve riportare `true` in caso di successo.

Puoi mettere i moduli `handler_XXXXX.js` in sottodirectory, o inserire symlink a directory o moduli così da gestirli con repository totalmente separati.

## Esempio: handler_dad_bot.js

```js
const REGEX = /(?<=sono )(il |lo |la |l'|un |uno |una |un')?.*?(?=($| ))/i;

async function handler(client, message, matches) {
    const chat = await message.getChat();
    const contact = await message.getContact();

    let name = matches[0];
    message.reply(`Ciao ${name}, sono papà`);
    return true;
}

module.exports = {
    handler: handler,
    REGEX: REGEX
};
```
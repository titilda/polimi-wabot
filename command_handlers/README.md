# Command Handlers

In questa directory, inserire moduli `handler_XXXXX.js` che esportano una stringa `COMMAND_NAME` con il nome del comando (es. `"hello"` per il comando `/hello`) e un  oggetto JS `command` così strutturato:

```js
command = {
    description: 'Descrizione del comando',
    syntax: 'esempio <argomento obbligatorio> [argomento facoltativo]',
    handler: exampleCommand
};
```

`exampleCommand` è l'handler del comando, e deve essere una funzione async che attende i seguenti argomenti:

 1. il client di WhatsApp Web (`WAWebJS.Client`)
 2. il messaggio che ha invocato il comando (`WAWebJS.Message`)
 3. un array contenente gli argomenti come stringhe (per comodità, in quanto non sempre è necessario operare direttamente sul messaggio)
 4. la classe di `nconf` con la configurazione del bot (`nconf.Provider`)

Puoi mettere i moduli `handler_XXXXX.js` in sottodirectory, o inserire symlink a directory o moduli così da gestirli con repository totalmente separati.

## Esempio: handler_marco.js

```js
const COMMAND_NAME = "marco";

const command = {
    description: 'Marco?',
    syntax: 'marco',
    handler: marcoCommand
};

async function chiCommand(client, message, args) {
    message.reply("Polo!")
}

module.exports = {
    COMMAND_NAME: COMMAND_NAME,
    command: command
};
```
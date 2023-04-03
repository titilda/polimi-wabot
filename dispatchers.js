const { importModules, importNpmPlugins, contactBotAdminCheck } = require('./utils.js');

class Handlers {
    constructor() {
        this.commands = {};
        this.keywords = [];
        this.loadHandlers();
    }
    loadHandlers() {
        this.commands = {};
        this.keywords = [];
        let handlers = {};

        Object.assign(handlers, importModules('./handlers/'));
        Object.assign(handlers, importModules('./plugins/', true /* reloads the plugins from disk */));
        Object.assign(handlers, importNpmPlugins());


        for (const [filename, handler] of Object.entries(handlers)) {
            if (Object.hasOwn(handler, 'commands')) {
                Object.assign(this.commands, handler.commands);
            }
            if (Object.hasOwn(handler, 'keywords')) {
                for (const keyword of handler.keywords) {
                    this.keywords.push(keyword);
                }
            }
            this.commands["help"] = {
                description: 'Mostra questo messaggio',
                syntax: 'help [comando]',
                handler: async (client, message, args, nconf) => {
                    let helpMessage = '';
                    if (args.length == 0) {
                        helpMessage = 'Comandi disponibili:\n';
                        for (const command of Object.keys(this.commands)) {
                            helpMessage += `• ${nconf.get("COMMAND_PREFIX")}${command}: ${this.commands[command].description}\n`;
                        };
                        helpMessage += `\nScrivi ${nconf.get("COMMAND_PREFIX")}help <comando> per maggiori informazioni su un comando specifico`;
                    }
                    else if (args.length == 1) {
                        let targetCommand = args[0];
                        if (targetCommand[0] == nconf.get("COMMAND_PREFIX")) {
                            targetCommand = targetCommand.slice(1);
                        }
                        if (this.commands[targetCommand]) {
                            helpMessage = `${nconf.get("COMMAND_PREFIX")}${targetCommand}: ${this.commands[targetCommand].description}\nSintassi: ${nconf.get("COMMAND_PREFIX")}${this.commands[targetCommand].syntax}`;
                        }
                        else {
                            helpMessage = `Comando non riconosciuto: ${nconf.get("COMMAND_PREFIX")}${targetCommand}. Scrivi ${nconf.get("COMMAND_PREFIX")}help per un elenco dei comandi disponibili`;
                        };
                    }
                    else {
                        helpMessage = `Scrivi ${nconf.get("COMMAND_PREFIX")}help per un elenco dei comandi disponibili`;
                    };
                    await message.reply(helpMessage);
                }
            };
            this.commands["reload"] = {
                description: 'Ricarica gli handlers',
                syntax: 'reload',
                handler:
                    async (client, message, args, nconf) => {
                        if (await message.getContact().then(contact => contactBotAdminCheck(contact, nconf))) {
                            await message.reply('Ricaricamento handlers...');
                            this.loadHandlers();
                            await message.reply('Handlers ricaricati');
                        }
                        else {
                            await message.reply('Non hai i permessi per eseguire questo comando');
                        }
                    }
            };
        }
    }
    async commandDispatcher(client, message, command, args, nconf) {
        if (this.commands[command]) {
            await this.commands[command].handler(client, message, args, nconf);
        }
        else {
            await message.reply(`Comando non riconosciuto: ${nconf.get("COMMAND_PREFIX")}${command}. Scrivi ${nconf.get("COMMAND_PREFIX")}help per un elenco dei comandi disponibili`);
        }
    }

    async keywordDispatcher(client, message, nconf) {
        for (const keyword of this.keywords) {
            const matches = message.body.match(keyword.regex);
            if (matches) await keyword.handler(client, message, matches, nconf);
        }
    }
}

module.exports = {
    Handlers: Handlers,
};
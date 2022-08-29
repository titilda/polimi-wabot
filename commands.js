var { nconf } = require('./config.js');
var { addMemberToGroup, removeMemberFromGroup, getGroups, getGroupMembers } = require('./groups.js');

const DISCORD_URL = nconf.get('DISCORD_URL');

const AVAILABLE_COMMANDS = {
    'help': { description: 'Mostra questo messaggio', syntax: 'help [comando]', handler: helpCommand },
    'discord': { description: 'Link al nostro server di Discord', syntax: 'discord', handler: discordCommand },
    'groups': { description: 'Elenco dei gruppi di ping', syntax: 'groups', handler: groupsCommand },
    'join': { description: 'Unisciti a un gruppo di ping specifico', syntax: 'join <gruppo>', handler: joinCommand },
    'leave': { description: 'Abbandona un gruppo di ping specifico', syntax: 'leave <gruppo>', handler: leaveCommand },
    'ping': { description: 'Pinga il gruppo specificato', syntax: 'ping <gruppo1> [gruppo2] ...', handler: pingCommand },
    'everyone': { description: 'Pinga tutti gli utenti', syntax: 'everyone', handler: everyoneCommand },
};

async function commandDispatcher(message, command, args) {
    if (AVAILABLE_COMMANDS[command]) {
        await AVAILABLE_COMMANDS[command].handler(message, args);
    }
    else {
        await message.reply(`Comando non riconosciuto: ${nconf.get("COMMAND_PREFIX")}${command}. Scrivi ${nconf.get("COMMAND_PREFIX")}help per un elenco dei comandi disponibili`);
    };
};

// COMMANDS

async function helpCommand(message, args) {
    let helpMessage = '';
    if (args.length == 0) {
        helpMessage = 'Comandi disponibili:\n';
        for (let command in AVAILABLE_COMMANDS) {
            helpMessage += `• ${nconf.get("COMMAND_PREFIX")}${command}: ${nconf.get("COMMAND_PREFIX")[command].description}\n`;
        };
        helpMessage += `\nScrivi ${nconf.get("COMMAND_PREFIX")}help <comando> per maggiori informazioni su un comando specifico`;
    }
    else if (args.length == 1) {
        let targetCommand = args[0];
        if (targetCommand[0] == nconf.get("COMMAND_PREFIX")) {
            targetCommand = targetCommand.slice(1);
        }
        if (AVAILABLE_COMMANDS[targetCommand]) {
            helpMessage = `${nconf.get("COMMAND_PREFIX")}${targetCommand}: ${AVAILABLE_COMMANDS[targetCommand].description}\nSintassi: ${nconf.get("COMMAND_PREFIX")}${AVAILABLE_COMMANDS[targetCommand].syntax}`;
        }
        else {
            helpMessage = `Comando non riconosciuto: ${nconf.get("COMMAND_PREFIX")}${targetCommand}. Scrivi ${nconf.get("COMMAND_PREFIX")}help per un elenco dei comandi disponibili`;
        };
    }
    else {
        helpMessage = `Scrivi ${nconf.get("COMMAND_PREFIX")}help per un elenco dei comandi disponibili`;
    };
    await message.reply(helpMessage);
};

async function discordCommand(message, args) {
    await message.reply(`Link al nostro server di Discord:\n${DISCORD_URL}\nℹ️ *Attenzione:* il server Discord non è ufficiale e non è affiliato ad alcuna organizzazione`);
};

async function groupsCommand(message, args) {
    var replyMessage = 'Gruppi di ping disponibili:';
    var groups = getGroups();
    for (let group of groups) {
        replyMessage += `\n• ${group}`;
    }
    await message.reply(replyMessage);
};

async function joinCommand(message, args) {
    if (args.length == 0) {
        await message.reply(`Scrivi ${nconf.get("COMMAND_PREFIX")}join <gruppo> per unirti a un gruppo di ping`);
    }
    else {
        let successfullyAdded = [];
        let unsuccessfullyAdded = [];
        let alreadyAdded = [];
        let replyMessageLines = [];

        for (let group of args) {
            group = group.toUpperCase();
            if (getGroups().includes(group)) {
                const contact = await message.getContact();
                if (!getGroupMembers(group).includes(contact.id.user)) {
                    addMemberToGroup(group, contact.id.user);
                    successfullyAdded.push(group);
                }
                else {
                    alreadyAdded.push(group);
                }
            }
            else { unsuccessfullyAdded.push(group) };
        };
        if (successfullyAdded.length == 1) {
            replyMessageLines.push(`Joinato gruppo: ${successfullyAdded.join(', ')}`);
        }
        else if (successfullyAdded.length > 1) {
            replyMessageLines.push(`Joinati gruppi: ${successfullyAdded.join(', ')}`);
        };

        if (alreadyAdded.length > 0) {
            replyMessageLines.push(`Sei già in: ${alreadyAdded.join(', ')}`);
        };

        if (unsuccessfullyAdded.length == 1) {
            replyMessageLines.push(`Gruppo non trovato: ${unsuccessfullyAdded.join(', ')}`);
        }
        else if (unsuccessfullyAdded.length > 1) {
            replyMessageLines.push(`Gruppi non trovati: ${unsuccessfullyAdded.join(', ')}`);
        };
        await message.reply(replyMessageLines.join('\n'));
    };
};

async function leaveCommand(message, args) {
    console.log('Not yet implemented')
}

async function pingCommand(message, args) {
    console.log('Not yet implemented')
}

async function everyoneCommand(message, args) {
    console.log('Not yet implemented')
}

// MODULE EXPORTS

module.exports = {
    commandDispatcher: commandDispatcher
};
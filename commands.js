var { nconf } = require('./config.js');
var { addMemberToGroup, removeMemberFromGroup, getGroups, getGroupMembers, getGroupsWithMember } = require('./groups.js');

const DISCORD_URL = nconf.get('DISCORD_URL');

const AVAILABLE_COMMANDS = {
    'help': { description: 'Mostra questo messaggio', syntax: 'help [comando]', handler: helpCommand },
    'discord': { description: 'Link al nostro server di Discord', syntax: 'discord', handler: discordCommand },
    'groups': { description: 'Elenco dei gruppi di ping', syntax: 'groups', handler: groupsCommand },
    'join': { description: 'Unisciti a un gruppo di ping specifico', syntax: 'join <gruppo>', handler: joinCommand },
    'leave': { description: 'Abbandona un gruppo di ping specifico', syntax: 'leave <gruppo>', handler: leaveCommand },
    'mygroups': { description: 'Elenco dei gruppi di ping a cui sei iscritto', syntax: 'mygroups', handler: mygroupsCommand },
    'ping': { description: 'Pinga il gruppo specificato (puoi rispondere con un ping a un messaggio per portarlo all\'attenzione del gruppo)', syntax: 'ping <gruppo1> [gruppo2] ...', handler: pingCommand },
    'everyone': { description: 'Pinga tutti gli utenti', syntax: 'everyone', handler: everyoneCommand },
};

async function commandDispatcher(client, message, command, args) {
    if (AVAILABLE_COMMANDS[command]) {
        await AVAILABLE_COMMANDS[command].handler(client, message, args);
    }
    else {
        await message.reply(`Comando non riconosciuto: ${nconf.get("COMMAND_PREFIX")}${command}. Scrivi ${nconf.get("COMMAND_PREFIX")}help per un elenco dei comandi disponibili`);
    };
};

// COMMANDS

async function helpCommand(client, message, args) {
    let helpMessage = '';
    if (args.length == 0) {
        helpMessage = 'Comandi disponibili:\n';
        for (let command in AVAILABLE_COMMANDS) {
            helpMessage += `• ${nconf.get("COMMAND_PREFIX")}${command}: ${AVAILABLE_COMMANDS[command].description}\n`;
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

async function discordCommand(client, message, args) {
    await message.reply(`Link al nostro server di Discord:\n${DISCORD_URL}\nℹ️ *Attenzione:* il server Discord non è ufficiale e non è affiliato ad alcuna organizzazione`);
};

async function groupsCommand(client, message, args) {
    var replyMessage = 'Gruppi di ping disponibili:';
    var groups = getGroups();
    for (let group of groups) {
        replyMessage += `\n• ${group}`;
    }
    await message.reply(replyMessage);
};

async function joinCommand(client, message, args) {
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

async function leaveCommand(client, message, args) {
    if (args.length == 0) {
        await message.reply(`Scrivi ${nconf.get("COMMAND_PREFIX")}leave <gruppo> per abbandonare un gruppo di ping`);
    }
    else {
        let successfullyRemoved = [];
        let unsuccessfullyRemoved = [];
        let alreadyRemoved = [];
        let replyMessageLines = [];

        for (let group of args) {
            group = group.toUpperCase();
            if (getGroups().includes(group)) {
                const contact = await message.getContact();
                if (getGroupMembers(group).includes(contact.id.user)) {
                    removeMemberFromGroup(group, contact.id.user);
                    successfullyRemoved.push(group);
                }
                else {
                    alreadyRemoved.push(group);
                }
            }
            else { unsuccessfullyRemoved.push(group) };
        };
        if (successfullyRemoved.length == 1) {
            replyMessageLines.push(`Abbandonato gruppo: ${successfullyRemoved.join(', ')}`);
        }
        else if (successfullyRemoved.length > 1) {
            replyMessageLines.push(`Abbandonati gruppi: ${successfullyRemoved.join(', ')}`);
        };

        if (alreadyRemoved.length > 0) {
            replyMessageLines.push(`Sei già fuori: ${alreadyRemoved.join(', ')}`);
        };

        if (unsuccessfullyRemoved.length == 1) {
            replyMessageLines.push(`Gruppo non trovato: ${unsuccessfullyRemoved.join(', ')}`);
        }
        else if (unsuccessfullyRemoved.length > 1) {
            replyMessageLines.push(`Gruppi non trovati: ${unsuccessfullyRemoved.join(', ')}`);
        };
        await message.reply(replyMessageLines.join('\n'));
    };
}

async function mygroupsCommand(client, message, args) {
    switch (args.length) {
        case 0:
            const contact = await message.getContact();
            let groupsOfUser = getGroupsWithMember(contact.id.user);
            if (groupsOfUser.length > 0) {
                await message.reply(`Sei in: ${groupsOfUser.join(', ')}`);
            }
            else {
                await message.reply(`Non sei in alcun gruppo`);
            };
            break;
        default:
            await message.reply(`Scrivi ${nconf.get("COMMAND_PREFIX")}mygroups per un elenco dei gruppi in cui sei`);
    };
};

async function pingCommand(client, message, args) {
    switch (args.length) {
        case 0:
            await message.reply(`Scrivi ${nconf.get("COMMAND_PREFIX")}ping <gruppo1> [gruppo2]... per inviare un ping a un gruppo`);
            break;
        default:
            const quotedMessage = await message.getQuotedMessage();
            const chat = await message.getChat();

            let peopleToPing = [];
            let pingedGroups = [];
            let nonExistingGroups = [];

            for (let group of args) {
                group = group.toUpperCase();
                if (getGroups().includes(group)) {
                    peopleToPing = peopleToPing.concat(getGroupMembers(group));
                    pingedGroups.push(group);
                }
                else { nonExistingGroups.push(group) };
            };
            // dedup
            peopleToPing = peopleToPing.filter((item, index) => peopleToPing.indexOf(item) === index);

            let pingDict = {};
            for (let person of peopleToPing) {
                try {
                    const contact = await client.getContactById(person + "@c.us");
                    console.log(contact.pushname);
                    pingDict[person] = contact;
                }
                catch (error) {
                    console.log(error);
                };
            };

            replyMessageLines = [];
            if (pingedGroups.length > 0) {
                replyMessageLines.push(`Ping inviato a gruppi: ${pingedGroups.join(', ')} (${Object.keys(pingDict).length} utenti)`);
            };
            if (Object.keys(pingDict).length > 0) {
                replyMessageLines.push("");
                replyMessageLines.push(Object.keys(pingDict).map(i => '@' + i).join(' '));
            };
            if (nonExistingGroups.length > 0) {
                replyMessageLines.push(`Gruppi non trovati: ${nonExistingGroups.join(', ')}`);
            };
            if (quotedMessage === undefined) {
                var replyOptions = { mentions: Object.keys(pingDict).map(key => pingDict[key]) };
                await message.reply(replyMessageLines.join('\n'), null, replyOptions);
            }
            else {
                var replyOptions = { mentions: Object.keys(pingDict).map(key => pingDict[key]), quotedMessageId: quotedMessage.id._serialized };
                await chat.sendMessage(replyMessageLines.join('\n'), replyOptions);
            };

    }
}

async function everyoneCommand(client, message, args) {
    const chat = await message.getChat()
    const quotedMessage = await message.getQuotedMessage();
    const participants = chat.participants;
    let pingDict = {};
    for (let participant of participants) {
        if (participant.id.user != client.info.wid._serialized.split("@")[0]) {
            pingDict[participant.id.user] = await client.getContactById(participant.id.user + "@c.us");
        };
    };
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

// MODULE EXPORTS

module.exports = {
    commandDispatcher: commandDispatcher
};
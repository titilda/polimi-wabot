const { groupChatCheck, addMemberToGroup, removeMemberFromGroup, getGroups, getGroupMembers, getGroupsWithMember } = require('./util.js');


const commands = {
    'groups': {
        description: "Elenco dei gruppi di ping",
        syntax: "groups",
        handler:
            async (client, message, args, nconf) => {
                if (!await groupChatCheck(message)) return;

                var replyMessage = 'Gruppi di ping disponibili:';
                var groups = getGroups(nconf);
                for (let group of groups) {
                    replyMessage += `\n• ${group}`;
                }
                await message.reply(replyMessage);
            }
    },
    'join': {
        description: "Unisciti a un gruppo di ping specifico",
        syntax: "join <gruppo>",
        handler:
            async (client, message, args, nconf) => {
                if (!await groupChatCheck(message)) return;

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
                        if (getGroups(nconf).includes(group)) {
                            const contact = await message.getContact();
                            if (!getGroupMembers(nconf, group).includes(contact.id.user)) {
                                if (!addMemberToGroup(nconf, group, contact.id.user) && !unsuccessfullyAdded.includes(group)) {
                                    unsuccessfullyAdded.push(group);
                                }
                                else {
                                    successfullyAdded.push(group);
                                };
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
                        replyMessageLines.push(`Gruppo non trovato o non joinabile: ${unsuccessfullyAdded.join(', ')}`);
                    }
                    else if (unsuccessfullyAdded.length > 1) {
                        replyMessageLines.push(`Gruppi non trovati o non joinabili: ${unsuccessfullyAdded.join(', ')}`);
                    };
                    await message.reply(replyMessageLines.join('\n'));
                };
            }
    },
    'leave': {
        description: "Abbandona un gruppo di ping specifico",
        syntax: "leave <gruppo>",
        handler:
            async (client, message, args, nconf) => {
                if (!await groupChatCheck(message)) return;

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
                        if (getGroups(nconf).includes(group)) {
                            const contact = await message.getContact();
                            if (getGroupMembers(nconf, group).includes(contact.id.user)) {
                                removeMemberFromGroup(nconf, group, contact.id.user);
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
                        replyMessageLines.push(`Non sei in: ${alreadyRemoved.join(', ')}`);
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
    },
    'mygroups': {
        description: "Elenco dei gruppi di ping a cui sei iscritto",
        syntax: "mygroups",
        handler:
            async (client, message, args, nconf) => {
                if (!message.getChat().then(chat => chat.isGroup)) {
                    await message.reply("Questo comando è disponibile solo in chat di gruppo");
                    return;
                };

                switch (args.length) {
                    case 0:
                        const contact = await message.getContact();
                        let groupsOfUser = getGroupsWithMember(nconf, contact.id.user);
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
            }
    },
    'ping': {
        description: "Pinga il gruppo specificato (puoi rispondere con un ping a un messaggio per portarlo all'attenzione del gruppo)",
        syntax: "ping <gruppo>",
        handler:
            async (client, message, args, nconf) => {
                if (!await groupChatCheck(message)) return;

                if (args.length == 0) {
                    await message.reply(`Scrivi ${nconf.get("COMMAND_PREFIX")}ping <gruppo> per pingare un gruppo`);
                    return;
                }

                const sourceChat = await message.getChat();
                const sourceContact = await message.getContact();
                const sourceParticipants = sourceChat.participants.map((participant) => { return participant.id.user });
                const sourceChatName = sourceChat.name;
                let successfullyPinged = [];
                let unsuccessfullyPinged = [];
                let replyMessageLines = [];
                let alreadyPinged = [];

                for (let group of args) {
                    group = group.toUpperCase();
                    if (getGroups(nconf).includes(group)) {
                        const members = getGroupMembers(nconf, group);
                        if (members.length > 0) {
                            const replyMessage = `Ping da ${sourceContact.pushname} su \`\`\`${sourceChatName}\`\`\` (gruppo *${group}*)\n\nUsa ${nconf.get("COMMAND_PREFIX")}leave nella chat del gruppo su cui sei stato pingato, seguito dal nome del gruppo di ping, per non ricevere più questi messaggi. Puoi altrimenti uscire dalla chat del gruppo.`;
                            successfullyPinged.push(group);
                            for (let member of members) {
                                const contact = await client.getContactById(member + "@c.us");
                                console.log(contact.id.user)
                                if (sourceParticipants.includes(contact.id.user) && !alreadyPinged.includes(contact.id.user)) {
                                    alreadyPinged.push(contact.id.user);
                                    try { await contact.getChat().then(async (targetChat) => { message.reply(replyMessage, targetChat.id._serialized) }); }
                                    catch (error) { console.log(error) };

                                }
                            }
                        }
                        else {
                            unsuccessfullyPinged.push(group);
                        };
                    }
                    else { unsuccessfullyPinged.push(group) };
                };
                if (successfullyPinged.length == 1) {
                    replyMessageLines.push(`Pingato gruppo: ${successfullyPinged.join(', ')}`);
                }
                else if (successfullyPinged.length > 1) {
                    replyMessageLines.push(`Pingati gruppi: ${successfullyPinged.join(', ')}`);
                };

                if (unsuccessfullyPinged.length == 1) {
                    replyMessageLines.push(`Gruppo non trovato o vuoto: ${unsuccessfullyPinged.join(', ')}`);
                }
                else if (unsuccessfullyPinged.length > 1) {
                    replyMessageLines.push(`Gruppi non trovati o vuoti: ${unsuccessfullyPinged.join(', ')}`);
                };
                await message.reply(replyMessageLines.join('\n'));

            }
    },
    'list': {
        description: "Elenco dei membri di un gruppo di ping",
        syntax: "list <gruppo>",
        handler:
            async (client, message, args, nconf) => {
                if (!await groupChatCheck(message)) return;

                if (args.length !== 1) {
                    await message.reply(`Scrivi ${nconf.get("COMMAND_PREFIX")}list <gruppo> per elencare i membri del gruppo`);
                    return;
                };
                args[0] = args[0].toUpperCase();
                if (!getGroups(nconf).includes(args[0])) {
                    await message.reply(`Gruppo ${args[0]} non trovato`);
                    return;
                };
                const members = getGroupMembers(nconf, args[0]);
                let messageLines = [];
                if (members.length > 0) {
                    messageLines.push(`Membri del gruppo ${args[0]}:`);
                    for (let member of members) {
                        const contact = await client.getContactById(member + "@c.us");
                        messageLines.push(`• ${contact.pushname}`);
                    };
                }
                else {
                    messageLines.push(`Il gruppo ${args[0]} è vuoto`);
                };
                await message.reply(messageLines.join('\n'));
            }
    },
};

// MODULE EXPORTS

module.exports = {
    commands: commands
};
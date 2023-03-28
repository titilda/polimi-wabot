const fs = require('fs');
const { Contact } = require('whatsapp-web.js');

function importModules(dir) {
    var modules = {};
    fs.readdirSync(dir).forEach(file => {
        path = fs.realpathSync(`${dir}/${file}`);
        if (fs.lstatSync(path).isDirectory()) {
            modules = Object.assign(modules, importModules(path));
        } else {
            if (file.endsWith('.js')) {
                modules[file] = require(path);
            }
        }
    });
    return modules;
}

async function messageGroupAdminCheck(message) {
    const contact = await message.getContact();
    const chat = await message.getChat();
    return contactGroupAdminCheck(contact, chat);
}

async function contactGroupAdminCheck(contact, chat) {
    var contactId
    if (contact instanceof Contact) {
        contactId = contact.id._serialized;
    } else {
        contactId = contact;
    }
    const participants = chat.participants;
    const callerParticipant = participants.find(participant => participant.id._serialized === contactId);
    try {
        return (callerParticipant.isAdmin || callerParticipant.isSuperAdmin);
    } catch (err) {
        if (err instanceof TypeError) {
            throw ReferenceError;
        }
    }
}

module.exports = {
    importModules: importModules,
    contactGroupAdminCheck: contactGroupAdminCheck,
    messageGroupAdminCheck: messageGroupAdminCheck
};
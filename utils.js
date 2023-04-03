const fs = require('fs');
const { exec } = require('child_process');
const constants = require('./constants.js');
const { Client, Contact } = require('whatsapp-web.js');

function importModules(dir, reload = false) {
    var modules = {};
    fs.readdirSync(dir).forEach(file => {
        path = fs.realpathSync(`${dir}/${file}`);
        if (fs.lstatSync(path).isDirectory()) {
            modules = Object.assign(modules, importModules(path));
        } else {
            if (file.endsWith('.js')) {
                if (reload) {
                    delete require.cache[require.resolve(path)];
                }
                modules[path] = require(path);
            }
        }
    });
    return modules;
}

function importNpmPlugins() {
    var plugins = {};
    exec('npm list --depth=0 --json', (err, stdout, stderr) => {
        if (err) {
            console.error(err);
            return;
        }
        var npmList = JSON.parse(stdout);
        for (const moduleName in Object.keys(npmList.dependencies)) {
            if (moduleName.startsWith(constants.NPM_PLUGIN_PREFIX)) {
                plugins[moduleName] = require(moduleName);
            }
        }
    });
    return plugins;
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

async function contactBotAdminCheck(contact, nconf) {
    var contactId
    if (contact instanceof Contact) {
        contactId = contact.id.user;
    } else {
        contactId = contact;
    }
    // check if contact is in the admin list in nconf
    if (nconf.get("BOT_ADMINS").includes(contactId)) {
        return true;
    }
}

module.exports = {
    importModules: importModules,
    importNpmPlugins: importNpmPlugins,
    contactGroupAdminCheck: contactGroupAdminCheck,
    messageGroupAdminCheck: messageGroupAdminCheck,
    contactBotAdminCheck: contactBotAdminCheck
};
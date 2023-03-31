var { nconf } = require('./config.js');

function getJoinMessages() {
    return nconf.get('welcome_messages');
}

function getRandomJoinMessage() {
    const messages = getJoinMessages();
    if (messages.length === 0) {
        return false;
    } else {
        return messages[Math.floor(Math.random() * messages.length)];
    }
}

module.exports = {
    getRandomJoinMessage: getRandomJoinMessage,
};
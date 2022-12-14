var { nconf } = require('./config');

function getRateLimit(key, chat, seconds) {
    let timeString = ""
    try {
        timeString = nconf.get("rateLimit")[key][chat];
    } catch (e) {
        // set to min epoch time (looong ago)
        timeString = "0";
    };
    if (timeString === undefined || timeString === null || timeString === "") {
        // set to min epoch time (looong ago)
        timeString = "0";
    };
    let timeStamp = new Date(timeString);
    let now = new Date();
    let diff = now - timeStamp;
    if (diff > seconds * 1000) {
        nconf.set(`rateLimit:${key}:${chat}`, now.toISOString()); // WARNING: this is not safe if key and chat can be controlled by someone else
        nconf.save();
        return false;
    }
    else {
        return true;
    };
};

module.exports = {
    getRateLimit: getRateLimit,
};
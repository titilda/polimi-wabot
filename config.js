const nconf = require('nconf');
const fs = require('fs');

const constants = require('./constants.js');

let configFile;

// Check if ENV is production or development
switch (process.env.NODE_ENV) {
    case 'production':
        configFile = constants.CONFIG_PATH_PRODUCTION;
        break;
    case 'development':
        configFile = constants.CONFIG_PATH_DEVELOPMENT;
        break;
    default:
        configFile = constants.CONFIG_PATH_PRODUCTION;
}

// Check if file exists
if (!fs.existsSync(configFile)) {
    console.log(`Config file ${configFile} does not exist. Please create it.`);
    process.exit(1);
}

nconf.use('file', { file: configFile });
nconf.load();

function getBrowserPath() {
    // null means that the built-in chromium will be used
    switch (process.platform) {
        case 'win32':
            if (fs.existsSync(constants.GOOGLE_CHROME_PATH_WIN32)) return constants.GOOGLE_CHROME_PATH_WIN32;
            else return null;
        case 'darwin':
            if (fs.existsSync(constants.GOOGLE_CHROME_PATH_DARWIN)) return constants.GOOGLE_CHROME_PATH_DARWIN;
            else return null;
        case 'linux':
            if (fs.existsSync(constants.GOOGLE_CHROME_PATH_LINUX)) return constants.GOOGLE_CHROME_PATH_LINUX;
            else if (fs.existsSync(constants.GOOGLE_CHROME_PATH_LINUX_ALT)) return constants.GOOGLE_CHROME_PATH_LINUX_ALT;
            else return null;
        default:
            return null;
    }
}

module.exports = {
    nconf: nconf,
    getBrowserPath: getBrowserPath,
}
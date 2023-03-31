const nconf = require('nconf');
const fs = require('fs');

var configFile

// Check if ENV is production or development
switch (process.env.NODE_ENV) {
    case 'production':
        configFile = './data/data.json';
        break;
    case 'development':
        configFile = './data/data.dev.json';
        break;
    default:
        configFile = './data/data.dev.json';
}

// Check if file exists
if (!fs.existsSync(configFile)) {
    console.log(`Config file ${configFile} does not exist. Please create it.`);
    process.exit(1);
}

nconf.use('file', { file: configFile });
nconf.load();

// Startup splash

module.exports = {
    nconf: nconf
}
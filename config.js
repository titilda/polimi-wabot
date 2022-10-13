var nconf = require('nconf');

var configFile

// Check if ENV is production or development
switch (process.env.NODE_ENV) {
    case 'production':
        configFile = './data.json';
        break;
    case 'development':
        configFile = './data.dev.json';
        break;
    default:
        configFile = './data.dev.json';
}

nconf.use('file', { file: CONFIG_FILE });
nconf.load();

module.exports = {
    nconf: nconf
}
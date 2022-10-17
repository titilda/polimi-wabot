var nconf = require('nconf');
var fs = require('fs');

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

// Check if file exists
if (!fs.existsSync(configFile)) {
    console.log(`Config file ${configFile} does not exist. Please create it.`);
    process.exit(1);
}

nconf.use('file', { file: configFile });
nconf.load();

module.exports = {
    nconf: nconf
}
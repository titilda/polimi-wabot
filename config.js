var nconf = require('nconf');

nconf.use('file', { file: './data.json' });
nconf.load();

module.exports = {
    nconf: nconf
}
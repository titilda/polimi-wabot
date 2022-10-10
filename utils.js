fs = require('fs');

function importModules(dir) {
    const modules = {};
    fs.readdirSync(dir).forEach(file => {
        const name = file;
        if (file.endsWith('.js')) {
            modules[name] = require(`${dir}/${file}`);
        }
    });
    return modules;
}

module.exports = {
    importModules: importModules
};
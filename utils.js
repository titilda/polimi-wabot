fs = require('fs');

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

module.exports = {
    importModules: importModules
};
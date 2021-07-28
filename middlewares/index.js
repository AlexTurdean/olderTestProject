require('fs').readdirSync(__dirname).forEach(function(file) {
    if (file.match(/\.js$/) !== null && file.slice(0,5) !== "index") {
        var name = file.replace('.js', '');
        exports[name] = require('./' + file);
    }
});
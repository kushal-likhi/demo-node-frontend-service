'use strict';

var extend = require('extend');
var path = require('path');
var traverse = require('traverse');

function evalJSBlocks(config) {
    var EVAL_USED_KNOWINGLY = eval; //Good practice, passes linters too.
    traverse(config).forEach(function (val) {
        if (typeof val === 'string' || val instanceof String) {
            this.update(val.replace(/("?)<\?JS=([\w\W\s\S\d\D.]+?):JS>\1/g, function (all, quote, expression) {
                return EVAL_USED_KNOWINGLY(expression);
            }));
        }
    });
    return config;
}

exports = module.exports = function ConfigManager(options, callback) {
    var appConfigRaw = require(path.join(options.appBaseDir, 'conf/AppConfig.json'));
    var configRaw = require(path.join(options.appBaseDir, 'conf/Config.json'));
    options.postProcess = options.postProcess || function (config) {
        return config;
    };
    callback(
        options.postProcess(
            evalJSBlocks(
                extend(
                    true,
                    {},
                    appConfigRaw.common,
                    configRaw.common,
                    appConfigRaw[options.env],
                    configRaw[options.env]
                )
            )
        )
    );
};
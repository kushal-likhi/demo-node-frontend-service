'use strict';

var async = require('async'),
    Utils = require('../src/Utils');


/**
 * Bootstrap File
 *
 * This file executes when the app starts.
 *
 * `init` method is called to invoke bootstrap.
 * */
exports.init = function (callback) {

    var tasks = [];

    //tasks.push(createDocumentationTestUser);

    async.series(tasks, callback);
};

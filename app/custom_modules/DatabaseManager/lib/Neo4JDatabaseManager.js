'use strict';

//Load Modules
var async = require('async'),
    path = require('path'),
    recursive = require('fs-readdir-recursive'),
    neo4j = require('node-neo4j'),
    request = require('request');

exports = module.exports = function (modelsDir, config, callback) {

    var tasks = [],
        connection,
        db;

    //make a connection
    tasks.push(function (callback) {
        connection = new neo4j(config.dataSource && config.dataSource.neo4j && config.dataSource.neo4j.url || "");
        //Test it
        request(config.dataSource.neo4j.url || "", function (err) {
            if (err) {
                if (config.dataSource.neo4j.ignoreConnectionError) {
                    log.warn('Unable to connect to Neo4j Database but ignoring as directed in AppConfig[`ignoreConnectionError`].');
                    callback();
                } else callback(new Error('Neo4J Database connection error ' + JSON.stringify({error: err})));
            } else callback();
        });
    });

    //Add fire Query method
    tasks.push(function (callback) {
        db = function (query, data, callback) {
            if (!callback) {
                callback = data;
                data = {};
            }
            connection.cypherQuery(query, data, callback);
        };
        callback();
    });

    function neoModel(domainName) {
        var domainDescriptor = require(path.join(modelsDir, 'neo4j', domainName));

        var model = function () {
            this.nodeName = domainName;
        };

        model.connection = connection;
        model.cypher = db;
        model.prototype.model = model;

        for (var method in domainDescriptor.methods) {
            if (domainDescriptor.methods.hasOwnProperty(method)) model.prototype[method] = domainDescriptor.methods[method];
        }

        for (var staticMethod in domainDescriptor.static) {
            if (domainDescriptor.static.hasOwnProperty(staticMethod)) model[staticMethod] = curryThis(domainDescriptor.static[staticMethod], model);
        }

        if (typeof domainDescriptor.bootstrap === 'function') {
            if (domainDescriptor.bootstrap.length === 1)model._bootstrap = domainDescriptor.bootstrap;
            else throw new Error('Invalid bootstrap directive in Neo4J Model: "' + domainName + '". It should have only 1 callback argument.')
        } else {
            model._bootstrap = function (cb) {
                cb();
            }
        }
        return model;
    }

    //Load Models
    tasks.push(function (callback) {
        try {
            var files = recursive(path.join(modelsDir, 'neo4j')),
                bootstrapTasks = [];
            files.forEach(function (file) {
                var _name = file.replace(/\.js$/, '');
                log.trace('Loading Neo4J Model:', _name);
                db[_name] = neoModel(_name);
                bootstrapTasks.push(function (cb) {
                    log.trace('Bootstrapping neo4j model', _name);
                    db[_name]._bootstrap(cb);
                });
            });
            async.series(bootstrapTasks, callback);
        } catch (err) {
            callback(err);
        }
    });

    async.series(tasks, function (err) {
        if (err) callback(err);
        else callback(null, db);
    });
};

function curryThis(fn, thisOpr) {
    return function () {
        return fn.apply(thisOpr, [].slice.call(arguments));
    }
}

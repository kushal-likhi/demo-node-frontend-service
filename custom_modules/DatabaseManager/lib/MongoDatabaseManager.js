'use strict';

//Load Modules
var async = require('async'),
    path = require('path'),
    recursive = require('fs-readdir-recursive'),
    mongoose = require('mongoose');

exports = module.exports = function (modelsDir, config, callback) {

    var tasks = [],
        connection,
        db;

    //make a connection
    tasks.push(function (callback) {
        connection = mongoose.createConnection(
            config.dataSource.mongo.url,
            {
                poolSize: config.dataSource.mongo.poolSize
            }
        );
        connection.on('error', function (err) {
            log.error(err);
            if (config.dataSource.mongo.ignoreConnectionError) {
                log.warn('Unable to connect to Mongo Database but ignoring as directed in AppConfig[`ignoreConnectionError`].');
                callback();
            }
            else callback(new Error('Database connection error ' + JSON.stringify(err)));
        });
        connection.once('open', function () {
            log.info('Connection has been established successfully to the Database.');
            callback();
        });
    });

    //Add fire Query method
    tasks.push(function (callback) {
        db = function (query, callback) {
            //Todo native mongo queries.
            callback(new Error('Not yet implemented'));
        };
        callback();
    });

    function mongoModel(domainName) {
        var domainDescriptor = require(path.join(modelsDir, 'mongo', domainName));
        var schema = new mongoose.Schema(domainDescriptor.schema);

        for (var method in domainDescriptor.methods) {
            if (domainDescriptor.methods.hasOwnProperty(method)) schema.methods[method] = domainDescriptor.methods[method];
        }

        for (var staticMethod in domainDescriptor.static) {
            if (domainDescriptor.static.hasOwnProperty(staticMethod)) schema.statics[staticMethod] = domainDescriptor.static[staticMethod];
        }

        for (var indexDescriptor in domainDescriptor.indexes) {
            if (domainDescriptor.indexes.hasOwnProperty(indexDescriptor)) {
                schema.index(domainDescriptor.indexes[indexDescriptor]);
            }
        }

        var _model = connection.model(domainName, schema);
        _model.ensureIndexes(function (err) {
            if (err) log.error(err);
        });

        return _model;
    }

    //Load Models
    tasks.push(function (callback) {
        try {
            var files = recursive(path.join(modelsDir, 'mongo'));
            files.forEach(function (file) {
                db[file.replace(/\.js$/, '')] = mongoModel(file.replace(/\.js$/, ''));
                log.trace('Loading MongoDB Model:', file.replace(/\.js$/, ''));
            });
            callback();
        } catch (err) {
            callback(err);
        }
    });

    async.series(tasks, function (err) {
        if (err) callback(err);
        else callback(null, db);
    });
};

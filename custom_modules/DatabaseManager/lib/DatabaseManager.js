'use strict';

//Load Modules
var async = require('async')/*,
    MongoDatabaseManager = require('./MongoDatabaseManager'),
    Neo4JDatabaseManager = require('./Neo4JDatabaseManager')*/;

exports = module.exports = function (modelsDir, config, callback) {

    var tasks = [],
        db = {};

    //Load mongo models
   /* tasks.push(function (callback) {
        MongoDatabaseManager(modelsDir, config, function (err, mdb) {
            if (err) callback(err);
            else if (mdb) callback(null, db.mongo = mdb);
            else callback(new Error('Unable to create mongo db interface!'));
        });
    });*/

    //Load neo4j models
    /*tasks.push(function (callback) {
        Neo4JDatabaseManager(modelsDir, config, function (err, ndb) {
            if (err) callback(err);
            else if (ndb) callback(null, db.neo4j = ndb);
            else callback(new Error('Unable to create neo4j db interface!'));
        });
    });*/

    async.series(tasks, function (err) {
        if (err) callback(err);
        else callback(null, db);
    });
};

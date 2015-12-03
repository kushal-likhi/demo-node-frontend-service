'use strict';

//Load auto-stripper for JSON requires
require('autostrip-json-comments');

//Load colors
require('colors');

//Ser error trace limits
Error.stackTraceLimit = Infinity;

//Load deps
var async = require('async'),
    Utils = require('./src/Utils'),
    Logger = require('./custom_modules/Logger'),
    ConfigManager = require('./custom_modules/ConfigManager'),
    DatabaseManager = require('./custom_modules/DatabaseManager'),
    path = require('path'),
    fs = require('fs'),
    Hapi = require('hapi'),
    os = require('os');

//The boot-loader tasks queue
var tasks = [];

//Some vars
var workerId = Utils.generateRandomKey(32),
    appBaseDir = __dirname,
    config,
    server,
    appEnv = process.env.NODE_ENV || 'development';

console.log('Running app in environment:', appEnv);

//Initialize config
tasks.push(function (callback) {
    new ConfigManager({appBaseDir: appBaseDir, env: appEnv}, function (_config) {
        config = _config;
        callback();
    });
});

//Initialize Logger
tasks.push(function (callback) {
    var logOnStdOut = config.logger.stdout.enabled;
    Utils.addSafeReadOnlyGlobal('log', new Logger(function (message) {
        if (logOnStdOut) {
            //Print on console the fully formatted message
            console.log(message.fullyFormattedMessage);
        }
    }, config.logger, appBaseDir));
    callback();
});

//Initialize HAPI
tasks.push(function (callback) {
    server = new Hapi.Server({
        connections: {
            routes: {
                cors: config.hapi.cors
            }
        }
    });
    server.connection({port: config.port});
    callback();
});

//specify globals
tasks.push(function (callback) {
    //Export config as a safe getter.
    Utils.addSafeReadOnlyGlobal('_config', config);

    Utils.addSafeReadOnlyGlobal('_workerId', workerId);

    Utils.addSafeReadOnlyGlobal('_appEnv', appEnv);

    //Add noop function in global context
    Utils.addSafeReadOnlyGlobal('noop', function () {
        log.info('Noop Executed with params:', arguments);
    });

    //set the base dir of project in global, This is done to maintain the correct base in case of forked processes.
    Utils.addSafeReadOnlyGlobal('__appBaseDir', appBaseDir);

    Utils.addSafeReadOnlyGlobal('_providers', []);

    callback();
});

//Load Models
tasks.push(function (callback) {
    new DatabaseManager(path.join(appBaseDir, 'models'), config, function (err, db) {
        if (err) callback(err);
        else callback(null, Utils.addSafeReadOnlyGlobal('db', db));
    });
});

//Load Service
tasks.push(function (callback) {
    //Inject all Singleton Services
    var services = {};
    try {
        var list = fs.readdirSync(path.join(appBaseDir, 'services'));
        list.forEach(function (item) {
            var name = item.toString().replace(/\.js$/, '');
            log.trace('Loading Service:', name);
            var _service = require(path.join(appBaseDir, 'services', name));
            var service = {};
            //Make all methods as event emitters.
            Object.keys(_service).forEach(function (methodName) {
                service[methodName] = _service[methodName].toEmitter();
            });
            services[name] = service;
        });
        Utils.addSafeReadOnlyGlobal('services', services);
        callback();
    } catch (err) {
        callback(err);
    }
});

//Load all event hooks
tasks.push(function (callback) {
    try {
        Utils.addSafeReadOnlyGlobal('globalEvent', new process.EventEmitter());
        var list = fs.readdirSync(path.join(appBaseDir, 'hooks'));
        list.forEach(function (item) {
            var name = item.toString().replace(/\.js$/, '');
            var hook = require(path.join(appBaseDir, 'hooks', name));
            if (typeof(hook.onEvent) === 'function') {
                log.trace('Loading Hook:', name);
                global.globalEvent.on(name, hook.onEvent);
            } else {
                log.error(new Error('Hook: [' + item + '] is invalid. Please define a function named "onEvent" in the Hook file. This function will be called on event.'));
            }
        });
        callback();
    } catch (err) {
        callback(err);
    }
});

//Load Cluster worker population
tasks.push(function (callback) {
    setInterval((function (fn) {
        fn();
        callback();
        return fn;
    })(function () {
        var details = {
            workerId: workerId,
            environment: appEnv,
            processName: process.title,
            versions: process.versions,
            architecture: process.arch,
            platform: process.platform,
            environmentVariables: process.env,
            pid: process.pid,
            features: process.features,
            debugPort: process.debugPort,
            listeningPort: config.port,
            nodeFilePath: process.execPath,
            processConfig: process.config,
            hostname: os.hostname(),
            uptime: os.uptime(),
            ram: {
                free: os.freemem(),
                total: os.totalmem()
            },
            cpus: os.cpus(),
            osType: {
                name: os.type(),
                release: os.release(),
                arch: os.arch()
            },
            networkInterfaces: os.networkInterfaces(),
            tempDir: os.tmpDir(),
            updated: new Date().getTime()
        };
        details = JSON.parse(JSON.stringify(details)); //sanitize
        db.mongo.ClusterWorker.update({workerId: workerId}, {$set: details}, {upsert: true}, function (err) {
            if (err) log.error(err);
        });
        try {
            db.mongo.ClusterWorker.find({updated: {$lt: (new Date().getTime() - (1000 * 40))}}, function (err, objList) {
                objList.forEach(function (obj) {
                    db.mongo.ClusterWorker.remove({_id: obj._id}, function (err) {
                        if (err) log.error(err);
                        else globalEvent.emit('OnClusterWorkerFoundInactive', obj);
                    });
                });
            });
        } catch (c) {
            log.error(c);
        }
    }), 1000 * 30);
});

//Load hapi plugins
tasks.push(function (callback) {
    require('./conf/hapiPluginsConf')(server, callback);
});

//Load extensions
tasks.push(function (callback) {
    require('./conf/extensions')(server, callback);
});

//Load Controllers
tasks.push(function (callback) {
    try {
        var list = fs.readdirSync(path.join(appBaseDir, 'controllers'));
        list.forEach(function (item) {
            if (item.search(/.js$/) !== -1) {
                log.trace('Loading Module:', item);
                require(path.join(appBaseDir, 'controllers', item)).route(server);
            }
        });
        callback();
    } catch (err) {
        callback(err);
    }
});

//Execute bootstrap
tasks.push(require('./conf/Bootstrap').init);

//Resume the stdin such that the process doesn't terminate on async processing
process.stdin.resume();

//Execute all tasks in series and boot-load the app.
async.series(tasks, function (err) {
    if (err) {
        log.error(err);
        process.exit(1);
    } else {
        //Let the server start :)
        server.start(function () {
            log.info('Server running at:', server.info.uri);
            try {
                process.send({
                    type: 'server-running',
                    pid: process.pid,
                    env: appEnv,
                    port: config.port,
                    url: config.serverUrl,
                    file: process.argv[1],
                    workerId: workerId
                });
            } catch (c) {
                //Running as separate worker without IPC
            }
        });
    }
});

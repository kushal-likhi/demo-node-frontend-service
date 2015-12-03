'use strict';
/**
 * Register all extensions here
 * */

var path = require('path'),
    async = require('async');

exports = module.exports = function registerExtensions(server, callback) {

    var tasks = [];

    //Hapi auth cookie
    tasks.push(function (callback) {
        server.register(require('hapi-auth-cookie'), function (err) {
            if (err) return callback(err);
            server.auth.strategy('session', 'cookie', {
                password: _config.auth.cookiePassword,
                cookie: _config.auth.sessionCookieName,
                /*redirectTo: '/login',*/
                isSecure: _config.auth.httpsEnabled
            });
            log.info('[HAPI PLUGIN] Loaded Hapi Oauth Cookie!');
            callback();
        });
    });

    //Load hapi swagger
    tasks.push(function (callback) {
        server.register({
            register: require('hapi-swagger'),
            options: {
                apiVersion: _config.appVersion,
                basePath: 'http:' + _config.serverUrl,
                info: {
                    title: _config.appName,
                    description: 'API Documentation!'
                },
                authorizations: {
                    session: {
                        passAs: 'header',
                        type: 'apiKey',
                        keyname: 'Authorization'
                    }
                }
            }
        }, function (err) {
            if (err) return callback(err);
            log.info('[HAPI PLUGIN] Loaded Hapi Swagger!');
            callback();
        });
    });

    async.series(tasks, callback);
};

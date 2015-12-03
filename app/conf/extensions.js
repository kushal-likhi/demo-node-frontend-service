'use strict';
/**
 * Register all extensions here
 * */

var path = require('path'),
    Utils = require('../src/Utils'),
    Hoek = require('hoek');

exports = module.exports = function registerExtensions(server, callback) {

    server.ext('onRequest', function (request, reply) {
        var token = request.headers['authorization'] || request.headers['Authorization'] || request.url.query.apiKey || undefined;
        if ((request.headers['referer'] || '').search(new RegExp(_config.serverUrl + '/documentation')) != -1) {
            token = __docUserToken__;
        }
        if (token) {
            token = token.trim().replace(/^Bearer /, '').trim();
            var session = Utils.decrypt(token);
            if (session instanceof Error) {
                log.warn('Invalid cookie passed, fall backing!', session.message);
            } else {
                request.auth.artifacts = session;
                request.auth.credentials = session;
                request.auth.isAuthenticated = true;
                request.auth.session = {
                    set: function (session, value) {
                        if (arguments.length > 1) {
                            var key = session;
                            Hoek.assert(key && typeof key === 'string', 'Invalid session key');
                            session = request.auth.artifacts;
                            Hoek.assert(session, 'No active session to apply key to');
                            session[key] = value;
                            return;
                        }
                        Hoek.assert(session && typeof session === 'object', 'Invalid session');
                        request.auth.artifacts = session;
                    },
                    clear: function (key) {
                        request.auth.artifacts = null;
                    },
                    ttl: function (msecs) {
                    }
                };
            }
        }
        if (request.url.path.search(/^(\/)?api\//) != -1) {
            request.isApi = true;
        }
        return reply.continue();
    });

    server.ext('onPostHandler', function (request, reply) {
        if (request.response && request.response.headers) {
            request.response.headers['X-SERVER'] = _config.appName;
            request.response.headers['X-SERVER-VERSION'] = _config.appVersion;
            request.response.headers['X-SERVER-ENV'] = _appEnv;
        }
        if(request.response && request.response.output && request.response.output.statusCode === 500 && request.isApi){
            log.error(request.response);
            reply.continue();
        }else if (request.response && request.response.output && request.response.output.statusCode === 500 && !request.isApi) {
            log.error(request.response);
            if (request.response.showView) {
                reply.view(request.response.showView.template, request.response.showView.model);
            } else {
                reply.view('500', {user: request.auth.isAuthenticated && request.auth.credentials || null});
            }
        } else if (request.response && request.response.output && request.response.output.statusCode === 404) {
            reply.view('404', {user: request.auth.isAuthenticated && request.auth.credentials || null});
        } else {
            reply(request.response);
        }
    });

    //Set views engine
    server.views({
        engines: {
            html: require('handlebars')
        },
        path: path.join(__appBaseDir, 'web-app', 'views', (_appEnv === 'production') ? 'min' : 'dev'),
        layoutPath: path.join(__appBaseDir, 'web-app', (_appEnv === 'production') ? 'dist' : 'public'),
        helpersPath: path.join(__appBaseDir, 'web-app', 'views', (_appEnv === 'production') ? 'min' : 'dev', 'helpers'),
        partialsPath: path.join(__appBaseDir, 'web-app', 'views', (_appEnv === 'production') ? 'min' : 'dev', 'partials'),
        defaultExtension: 'html',
        isCached: _appEnv === 'production',
        layout: 'masterLayout',
        context: {
            title: _config.appName,
            description: 'Core system',
            author: 'Kushal Likhi'
        }
    });

    //All done
    callback();
};

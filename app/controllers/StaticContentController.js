'use strict';

var path = require('path');

//Helps serving static content from web-app directory
exports.route = function (server) {

    //Serve the desired directory
    server.route({
        method: 'GET',
        path: '/{param*}',
        handler: {
            directory: {
                path: path.join(__appBaseDir, 'web-app', (_appEnv === 'production') ? 'dist' : 'public'),
                listing: (_appEnv !== 'production'),
                index: true
            }
        }
    });
};

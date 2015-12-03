'use strict';

var passwordHash = require('password-hash');

//Helps serving static content from web-app directory
exports.route = function (server) {

    //Serve the desired directory
    server.route({
        method: 'GET',
        path: '/',
        config: {
            auth: {
                mode: 'try',
                strategy: 'session'
            }
        },
        handler: function (request, reply) {
            //If loggedin go to dashboard
            if (request.auth.isAuthenticated) return reply.redirect('/dashboard');

            //Show home page otherwise
            reply.view('mainPage');
        }
    });

};

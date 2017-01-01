/**
 * Dronesmith Cloud
 *
 * Principle Engineer: Geoff Gardner <geoff@dronesmith.io>
 *
 * Copyright (C) 2016 Dronesmith Technologies Inc, all rights reserved.
 * Unauthorized copying of any source code or assets within this project, via
 * any medium is strictly prohibited.
 *
 * Proprietary and confidential.
 */

'use strict';

/**
 *
 * Routing table
 *
 */

var
  path = require('path'),
  session = require('../lib/controllers/session'),
  api = require('../lib/controllers/api')
  ;

module.exports = function(app, route) {
    // catchall route
    route
        .all('*', function (request, response, next) {
            // placeholder for catching each request
            next();
        })

        // Authenticate a session (allows logins)
        .post   ('/index/session',                session.authenticate)

        // Get user session
        .get    ('/index/session',                session.poll)

        // Get use info
        .get    ('/index/user',                   api.getUser)

        // Check to see what drones are online or not
        .get    ('/index/online',                 api.checkDrones)

        // API requests
        .post   ('/api/*',                        api.postHandler)
        .put    ('/api/*',                        api.putHandler)
        .delete ('/api/*',                        api.delHandler)
        .get    ('/api/*',                        api.getHandler)

    ;

    if (app.get('env') === 'development') {
        route
            // tests for 404 and 500s
            .all('/404', function (req, res) {
                logger.warn("Can not find page: " + req.route.path);
                res.status(404);
                res.render('404', {title: '404: File Not Found'});
            })
            .all('/500', function (req, res, next) {
                next(new Error('keyboard cat!'));
            })
        ;
    }

    return route;
};

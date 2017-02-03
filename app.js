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

// Node modules
var
  fs = require('fs'),
  http = require('http'),
  https = require('https'),
  cluster = require('cluster'),
  path = require('path'),
  uuid = require('uuid');

// Express modules
var express = require('express'),
  compression = require('compression'),
  bodyParser = require('body-parser'),
  methodOverride = require('method-override'),
  expressValidator = require('express-validator'),
  cookieParser = require('cookie-parser'),
  favicon = require('serve-favicon'),
  session = require('express-session');

// get basic properties and set logging.
var config = require('./config/config.js'),
  env = config.application.env || 'development',
  log = require('./lib/log.js').getLogger(__filename);

// Init
var app = express();

// set port and environment properties
app.set('port', config.application.port || 3000);
app.set('env', env);

// Init Session
var serveSession = session({
  genid: function(req) {
    return uuid.v4();
  },
  secret: 'CLx2wWpEJ94KV8Fw4ewVhRzU',
  resave: false,
  saveUninitialized: false
});

app.use(compression());
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: false}));
// app.use(bodyParser.raw({limit: '50mb'}));
app.use(methodOverride());
app.use(expressValidator());
// app.use(cookieParser());
app.use(favicon(path.join(__dirname, 'public/assets/favicon.ico')));
app.use(serveSession);
// app.use(lessMiddleware(path.join(__dirname, 'forge-ux/public/theme'), {
// 	dest: path.join(__dirname, 'forge-ux/public'),
//   debug: false
// }));

// Render statics (including HTML)
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
  log.debug('[REQUEST]', req.ip, req.method, req.url);
  next();
});
// Init the router
var Router = express.Router();
var router = require('./routes/index')(app, Router);

// Index routes should always have a session.
app.use('/index/', function(req, res, next) {

  // ...with the exception of /session/ which handles this itself.
  if (req.path == '/session' || req.path == '/user/forgotPassword') {
    next();
  } else if (req.path == '/user' && req.method == 'POST') {
    next(); // open up registration
    // res.status(400).json({error: "Sorry, Forge Cloud is currently invite only."});
  } else if (req.path == '/session/newuser' && req.method == 'POST') {
    next();
  } else if (req.path == '/session/reset' && req.method == 'POST') {
    next();
  }else if (!req.session.email || !req.session.key) {
  res.status(400).json({error: "Not logged in."});
  } else {
    next();
  }
});

app.use('/', router);

// Handle 404s
app.use(function (req, res) {
    log.warn("Can not find page: " +  req.originalUrl);
    res.status(404);
    res.sendFile(path.join(__dirname, 'public', '404.html'));
});

// Handle 500s
app.use(function (error, req, res, next) {
    log.error(error);
    res
      .status(500)
      .send(error.stack); // rendering this via angular
});

app.locals.pretty = true;

require('./lib/controllers/mission.js').init();

if (cluster.isMaster
    && (app.get('env') !== 'development')
    && (process.argv.indexOf('--singleProcess') < 0)) {

    var cpuCount = require('os').cpus().length;

    log.info('[MASTER] Deploying cluster across', cpuCount, 'logical cores.' );

    for (var i = 0; i < cpuCount; ++i) {
      cluster.fork();
    }

    cluster.on('exit', function(worker) {
      log.warn('[MASTER] Worker', worker.id, 'died.');
      cluster.fork();
    });
} else {
    var server = http.createServer(app);
    server.listen(app.get('port'), function () {
      var host = server.address().address;
      var port = server.address().port;

      log.info('[WORKER] Server listening on', app.get('port'));
      log.info('[WORKER] Running in', app.get('env').toUpperCase(), 'mode');
    });
}

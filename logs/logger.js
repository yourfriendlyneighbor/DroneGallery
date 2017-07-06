var
winston = require('winston'),
util    = require('util');


function RequestProfiler() {

  /**
   * Tracks and profile all requests made to non static expressjs routes
   */
   var logger = new (winston.Logger)({
     exitOnError: false,
     transports: [
    //    new (winston.transports.File)({
    //        name: 'info-file',
    //        filename: './logs/info.log',
    //        level: 'info'
    //    }),
    //    new (winston.transports.File)({
    //      name: 'verbose-file',
    //      filename: './logs/verbose.log',
    //      level: 'verbose'
    //    }),
    //    new (winston.transports.File)({
    //      name: 'warn-file',
    //      filename: './logs/warn.log',
    //      level: 'warn'
    //    }),
    //    new (winston.transports.File)({
    //      name: 'debug-file',
    //      filename: './logs/debug.log',
    //      level: 'debug'
    //    }),
    //    new (winston.transports.File)({
    //      name: 'silly-file',
    //      filename: './logs/silly.log',
    //      level: 'silly'
    //    }),
       new (winston.transports.File)({
         name: 'error-file',
         filename: './logs/error.log',
         level: 'error'
       }),
       new (winston.transports.Console)({ level: 'error' })
     ],
     exceptionHandlers: [
         new winston.transports.File({ filename: './logs/error.log' })
     ]
   });


  /**
   * An express middleware for profiling requests made to API
   * @returns {Function}
   */
  function profile() {
    return function(req, res, next) {
      req.profileInfo = util.format('%s %s', req.method, req.originalUrl);
      logger.profile(req.profileInfo);

      // Apply the detour to the express res.send function
      var sendFn = res.send;
      res.send = function() {
        sendFn.apply(res, arguments);
        logger.profile(req.profileInfo);
      };
      next();
    };
  }

  return {
    profile : profile,
    logger  : logger
  };
}

module.exports = new RequestProfiler();

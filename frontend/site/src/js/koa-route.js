
'use strict';

/**
 * Module dependencies.
 */

const pathToRegexp = require('path-to-regexp');
const methods = require('methods');

methods.forEach(function(method){
  module.exports[method] = create(method);
});

module.exports.del = module.exports.delete;
module.exports.all = create();

function create(method) {
  if (method) method = method.toUpperCase();

  return function(path, fn, opts){
    const re = pathToRegexp(path, opts);

    return async function (ctx, next){
      const m = re.exec(ctx.path)

      // method
      if (!matches(ctx, method)) return next();

      // path
      if (m) {
        const args = m.slice(1).map(decode);
        args.push(next);

        // "await fn.apply(ctx, args)" is not supported with Babel
        // hack to support up to 4 path parameters
        if (args.length === 1){
          return await fn(ctx, args[0])
        }else if (args.length === 2){
          return await fn(ctx, args[0], args[1])
        }else if (args.length === 3){
          return await fn(ctx, args[0], args[1], args[2])
        }else if (args.length === 4){
          return await fn(ctx, args[0], args[1], args[2], args[3])
        }else if (args.length === 5){
          return await fn(ctx, args[0], args[1], args[2], args[3], args[4])
        }
      }

      // miss
      return next();
    }
  }
}

/**
 * Decode value.
 */

function decode(val) {
  if (val) return decodeURIComponent(val);
}

/**
 * Check request method.
 */

function matches(ctx, method) {
  if (!method) return true;
  if (ctx.method === method) return true;
  if (method === 'GET' && ctx.method === 'HEAD') return true;
  return false;
}

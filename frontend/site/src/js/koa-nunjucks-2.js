/*!
 * koa-nunjucks-2
 * Copyright (c) 2015 strawbrary
 * MIT Licensed
 */
'use strict';

var nunjucks = require('nunjucks');

/**
 * @type {Object}
 */
const defaultSettings = {
  autoescape: true,        // Whether variables are automatically escaped in templates
  dev: false,              // Determines if full stack traces from the origin of the error are shown*
  ext: 'html',             // Specifying an extension allows you to omit extensions in this.render calls
  lstripBlocks: false,     // Whether to strip leading whitespace from blocks
  noCache: false,          // Whether to disable template caching
  path: undefined,         // Path to the templates
  throwOnUndefined: false, // Throw an error if a template variable is undefined
  trimBlocks: false,       // Whether to trim first newline at end of blocks
  watch: true              // Reload templates when they are changed
};

/**
 * Config options which belong to this package, not Nunjucks itself
 * @type {Array.<string>}
 * @const
 */
const packageConfigOptions = [
  'ext',
  'path',
  'writeResp'
];

/**
 * @param {Object=} opt_config
 */
exports = module.exports = function(opt_config) {
  var config = {};
  if (config) {
    config = opt_config;
  }

  for (var defaultSetting in defaultSettings){
    if (defaultSettings.hasOwnProperty(defaultSetting) && !opt_config.hasOwnProperty(defaultSetting)){
      config[defaultSetting] = defaultSettings[defaultSetting];
    }
  }

  if (!config.path){
    config.path = process.cwd();
  }
  config.ext = '.' + config.ext.replace(/^\./, '');

  var env = nunjucks.configure(config.path, config);

  /**
   * Main function to be placed on app.context
   * @param {Object} context
   * @param {string} view
   * @param {Object=} opt_context
   * @param {Function=} opt_callback
   * @returns {string}
   */
  var render = function(view, opt_context, opt_callback) {
    view += config.ext;
    var html = env.render(view, opt_context, opt_callback);
    return html;
  };

  return render;
};

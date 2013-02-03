"use strict"

# Filters

angular
  .module('em.filters', [])
  .filter('interpolate',
    ['version', (version)->
      (text)->
        return String(text).replace(/\%VERSION\%/mg, version)
    ])

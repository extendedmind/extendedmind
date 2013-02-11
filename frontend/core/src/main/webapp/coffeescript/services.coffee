"use strict"

# Services

angular.module('em.services', [])
  .value('version', '0.1')
  .value('title', '0.1')
  .factory('page', () -> 
    PAGE_TITLE = 'extended mind'
    subTitle = null
    return { getSubTitle: () ->
               return subTitle
             getTitle: () -> 
               return if subTitle? then (PAGE_TITLE + ' | ' + subTitle) else PAGE_TITLE
             setSubTitle: (newsubTitle) -> 
               subTitle = newsubTitle })

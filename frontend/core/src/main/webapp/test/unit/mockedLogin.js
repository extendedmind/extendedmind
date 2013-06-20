'use strict';

angular.module('mockedLogin', []).value('usersJSON', {
    entry : [{
        'email' : 'timo@ext.md'
    }, {
        'email' : 'jp@ext.md'
    }]
}).value('authenticateJSON', {
    entry : [{
        'userId': 'timo',
        'token': 'timo-tiuraniemi'
    }, {
        'userId': 'jp',
        'token': 'jp-salo'
    }
]
});

'use strict';

module.exports = function() {
    var fortunes = [
        'One finds limits by pushing them.',
        'Even if you are on the right track, You’ll get run over if you just sit there',
        'You must either modify your dreams or magnify your skills',
        'Every accomplishment starts with a decision to try',
        'People rarely buy what they need. They buy what they want',
        'You miss 100 percent of the shots you don’t take'
    ];
    var x = Math.floor(Math.random() * fortunes.length);
    return fortunes[x];
};

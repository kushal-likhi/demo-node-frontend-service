'use strict';

/*
 * This file contains the common util methods
 * */

var crypto = require('crypto');

/**
 * Convert To ObjectId
 * This method returns the object of ObjectId from the string passed. If the string is invalid then null is returned.
 *
 * @param {String} id The String ID
 *
 * @return {ObjectId} the objectId instance
 *
 * */
/*exports.convertToObjectId = function (id) {
    var objectId = null;
    if (id instanceof ObjectId) {
        objectId = id;
    } else {
        try {
            objectId = ObjectId(id);
        } catch (c) {
            objectId = null;
        }
    }
    return objectId;
};*/

/**
 * Used to generate a random key of desired bytes.
 *
 * @param {Number} length Length of the bytes in key string.
 *
 * @return {String} the crypt key
 * */
exports.generateRandomKey = function (length) {
    length = length || 64;
    try {
        return crypto.randomBytes(length).toString('hex');
    } catch (ex) {
        return crypto.pseudoRandomBytes(length).toString('hex');
    }
};

/**
 * Add a global in the system
 * */
exports.addSafeReadOnlyGlobal = function (prop, val) {
    Object.defineProperty(global, prop, {
        get: function () {
            return val;
        },
        set: function () {
            log.warn('You are trying to set the READONLY GLOBAL variable `', prop, '`. This is not permitted. Ignored!');
        }
    });
};

//Add a emitter transform for functions.
Function.prototype.toEmitter = function () {
    var origFunc = this;
    return function () {
        var args = arguments;
        var emitter = new process.EventEmitter();
        process.nextTick(function () {
            return origFunc.apply(emitter, args);
        });
        return emitter;
    };
};

//Curry this operator
exports.curryThis = function (fn, thisOpr) {
    return function () {
        return fn.apply(thisOpr, [].slice.call(arguments));
    }
};

/**
 * This method decrypts the cryptext
 *
 * @param {String} cryptText crypt text
 *
 * @return {String|Object|Error} The data or Error object
 *
 * */
exports.decrypt = function (cryptText) {
    var data = null;
    try {
        var decipher = crypto.createDecipher(_config.crypto.generatorAlgorithm, _config.crypto.generatorSecret);
        data = JSON.parse(decipher.update(cryptText, 'hex') + decipher.final());
    } catch (c) {
        c.message = "Unable to decode the cryptext. Tampered input! Or Invalid Secret! " + c.message;
        return new Error(c);
    }
    if (data && data.payload) {
        return data.payload;
    } else {
        return new Error("Unable to parse. Bad data or secret.");
    }
};

/**
 * Generate the cryptext from data
 *
 * @param {Object} data the data token has to carry
 *
 * @return {String|Error} The access token or Error object
 * */
exports.encrypt = function (data) {
    var json = JSON.stringify({payload: data});
    try {
        var cipher = crypto.createCipher(_config.crypto.generatorAlgorithm, _config.crypto.generatorSecret);
        return cipher.update(json, 'binary', 'hex') + cipher.final('hex');
    } catch (c) {
        return new Error(c);
    }
};

//Trims user to session obj
exports.userToSession = function (user, expires) {
    return {
        _id: user._id.toString(),
        deviceIds: user.deviceIds,
        auth: {
            roles: user.auth.roles
        },
        created: +new Date(),
        expires: expires || 0
    };
};

exports.convertFullNameToObject = function (n) {
    var name = {
        first: '',
        last: ''
    };
    (n || '').trim().replace(/^([^ ]+)(( +[^ ]+)*)$/, function (all, first, last) {
        name.first = first || '';
        name.last = (last || '').trim().replace(/ +/g, ' ');
    });
    return name;
};

exports.convertObjectToFullName = function (nameObj, defaultVal) {
    if (!nameObj) return defaultVal;
    if (typeof nameObj == 'string' || nameObj instanceof String) return nameObj;
    var nameBreaks = [];
    if (nameObj.first) nameBreaks.push(nameObj.first);
    if (nameObj.middle) nameBreaks.push(nameObj.middle);
    if (nameObj.last) nameBreaks.push(nameObj.last);
    var name = nameBreaks.join(' ').trim().replace(/ +/g, ' ');
    return (name.length ? name : defaultVal);
};

exports.generateFunkyName = function () {
    var adjs = ["autumn", "hidden", "bitter", "misty", "silent", "empty", "dry",
            "dark", "summer", "icy", "delicate", "quiet", "white", "cool", "spring",
            "winter", "patient", "twilight", "dawn", "crimson", "wispy", "weathered",
            "blue", "billowing", "broken", "cold", "damp", "falling", "frosty", "green",
            "long", "late", "lingering", "bold", "little", "morning", "muddy", "old",
            "red", "rough", "still", "small", "sparkling", "throbbing", "shy",
            "wandering", "withered", "wild", "black", "young", "holy", "solitary",
            "fragrant", "aged", "snowy", "proud", "floral", "restless", "divine",
            "polished", "ancient", "purple", "lively", "nameless"]

        , nouns = ["waterfall", "river", "breeze", "moon", "rain", "wind", "sea",
            "morning", "snow", "lake", "sunset", "pine", "shadow", "leaf", "dawn",
            "glitter", "forest", "hill", "cloud", "meadow", "sun", "glade", "bird",
            "brook", "butterfly", "bush", "dew", "dust", "field", "fire", "flower",
            "firefly", "feather", "grass", "haze", "mountain", "night", "pond",
            "darkness", "snowflake", "silence", "sound", "sky", "shape", "surf",
            "thunder", "violet", "water", "wildflower", "wave", "water", "resonance",
            "sun", "wood", "dream", "cherry", "tree", "fog", "frost", "voice", "paper",
            "frog", "smoke", "star"];

    var name = adjs[Math.floor(Math.random() * (adjs.length - 1))] + " " + nouns[Math.floor(Math.random() * (nouns.length - 1))];
    return exports.capitalise(name);
};

exports.capitalise = function (str) {
    return str.replace(/\b\w/g, function (m) {
        return m.toUpperCase()
    });
};

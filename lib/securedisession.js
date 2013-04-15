/**
 * User: ciprian
 * Author: Ciprian Danea <ciprian@danea.ro>
 * Date: 4/10/13
 * Time: 12:28 PM
 */



var microtime = require('microtime');
var express = require('express');
var redis = require("redis");
var util = require('util'), events = require('events'), _ = require('underscore');
var instance = null;
var Session = function(options){
    if(!instance) {
        options = _.extend({
            prefix: "session",
            name : "rsid",
            autostart: true,
            ttl: 86400000,
            clientSecret: "really secret secret string",
            storeSecret: "very secret secret string"
        }, options || {});
        this.options = options;
        events.EventEmitter.apply(this);
        instance = this;
    }
    return instance;
};
util.inherits(Session, events.EventEmitter);
Session.instance = null;
Session.prototype.start = function(sessionId){
    this.started = microtime();
};
Session.prototype.destroy = function(){};
Session.prototype.gc = function(){};
Session.prototype.write = function(){};
Session.prototype.read = function(){};
Session.prototype.close = function(){};

Session.prototype.middleware = function(req, res, next) {
    // read sessionId from req
    //
};



exports.createClient = function(clientOptions) {
    return redis.createClient(clientOptions);
};


exports.RedisSession = Session;
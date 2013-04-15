/**
 * User: ciprian
 * Author: Ciprian Danea <ciprian@danea.ro>
 * Date: 4/12/13
 * Time: 12:14 PM
 */
var redis = require("redis"),
    util = require('util'),
    events = require('events'),
    Crypto = require('crypto'),
    _ = require('underscore'),
    debug = require('debug')('connect:session:store:securedistore'),
    redisOK = 'OK'
;

module.exports = exports = function(StoreClass) {

    var bool = typeof(true),
        string = typeof ("string"),
        object = typeof ({}),
        array = typeof ([]),
        nul = typeof (null),
        undefined = typeof (aRandomUndefinedVariable),
        number = typeof (1000);

        config = {
            socket_nodelay :                {type: bool, implicit: true, access: true, doc: "Whether to call setNoDelay() on the TCP stream, which disables the Nagle algorithm on the underlying socket. Setting this option to false can result in additional throughput at the cost of more latency. Most applications will want this set to true."},
            return_buffers :                {type: bool, implicit: false, access: false, doc: "Defaults to false. If set to true, then all replies will be sent to callbacks as node Buffer objects instead of JavaScript Strings."},
            detect_buffers :                {type: bool, implicit: false, access: false, doc: "Defaults to false. If set to true, then replies will be sent to callbacks as node Buffer objects if any of the input arguments to the original command were Buffer objects. This option lets you switch between Buffers and Strings on a per-command basis, whereas return_buffers applies to every command on a client."},
            max_attempts :                  {type: number, implicit: null, access: false, doc: "Defaults to null. By default client will try reconnecting until connected. Setting max_attempts limits total amount of reconnects."},
            connect_timeout :               {type: number, implicit: false, access: false, doc: "Defaults to false. By default client will try reconnecting until connected. Setting connect_timeout limits total time for client to reconnect. Value is provided in milliseconds and is counted once the disconnect occured."},
            enable_offline_queue :          {type: bool, implicit: true, access: true, doc: "Defaults to true. By default, if there is no active connection to the redis server, commands are added to a queue and are executed once the connection has been established. Setting enable_offline_queue to false will disable this feature and the callback will be execute immediately with an error, or an error will be thrown if no callback is specified."},
            retry_max_delay :               {type: number, implicit: null, access: false, doc: "Defaults to null. By default every time the client tries to connect and fails time before reconnection (delay) almost doubles. This delay normally grows infinitely, but setting retry_max_delay limits delay to maximum value, provided in milliseconds."},
            no_ready_check :                {type: bool, implicit: null, access: false, doc: "The redis client will emit connect at the same time as it emits ready unless client.options.no_ready_check is set. If this options is set, connect will be emitted when the stream is connected, and then you are free to try to send commands."},
            port :                          {type: number, implicit: 6379, access: true, doc: "The port the server is listening on."},
            host :                          {type: string, implicit: "127.0.0.1", access: true, doc: "The host the server is installed on."},
            prefix :                        {type: string, implicit: "sess_", access: true, doc: "A prefix that the application shares. This is useful to avoid collisions with other applications' namespaces."},
            db :                            {type: string, implicit: null, access: true, doc: "The redis database to use."},
            ttl :                           {type: number, implicit: 86400, access: true, doc: "The sessions will hard-expire after this amount of seconds."},
            filter :                        {type: string, implicit: null, access: true, doc: "1. Empty for no filter - this is the unsafe default, \n" +
                "2. 'a secret string' to sign the data in the redis server - this protects you from session injections, or\n" +
                "3. 'cipher;a secret string' used to encrypt the sessions in the redis server\n" +
                "2 and 3 are useful if you do not control the server and others might have access to the session data which would open your application to session highjacking and injections, " +
                "or you want to make sure that any private/personal info is hidden and you want to comply with PCIs about sensitive private user data."}
        };


    /**
     * options for redis:
     *          {int}socket_nodelay|true
     *          {int}command_queue_high_water|1000
     *          {int}command_queue_low_water|0
     *          {int}max_attempts|null
     *          {int}connect_timeout|false
     *          {bool}enable_offline_queue|true
     *          {int}retry_max_delay|null
     *          no_ready_check|flag
     *          socket_nodelay|flag
     *          {int}port|6379
     *          {string}host|"127.0.0.1",
     *
     * options for session:
     *          {string}prefix
     *          {string}db
     *          {int}ttl|86400
     *          {string}filter|null,falsy,sign-secret,cypher;secret;iv
     * @api private
     * @param {Object} options
     * @constructor
     */
    var SecuRediStore = function(options) {
        // force clone of the original options object, since the redis client will add some key(s) and modify it if it's a reference
        var options = _.extend({}, options);
        var that = this;
        StoreClass.apply(this);
        this.options = options || {};
        this.prefix = this.options.prefix || "sess_";
        this.ttl = this.options.ttl || 86400;
        this.redis = redis.createClient(this.options.port, this.options.host, this.options);
        //^^^------ options.client || new redis.createClient(options.port || options.socket, options.host, options);
        this.redis.on('error', function(){that.emit('disconnect')});
        this.redis.on('connect', function(){that.emit('connect')});
        if(this.options.db) {
            self.client.select(this.options.db);
            self.client.on("connect", function() {
                self.client.send_anyways = true;
                self.client.select(this.options.db);
                self.client.send_anyways = false;
            });
        }
        this.filter = this.options.filter || null;
        this.setFilter = this.getFilter = function(data){
            debug("Null setter and getter filter");
            return data
        };
        if(this.filter && this.filter.toString().length) {
            var filter = this.filter.toString().split(';')
            if(filter.length == 1) {
                //just sign
                var secret = this.filter.toString();
                this.setFilter = function(data) {
                    return data + '.' + Crypto.createHmac('RSA-SHA256', secret).update(data).digest('base64').replace(/\=+$/, '');
                }
                this.getFilter = function(data) {
                    var Data = data.slice(0, data.lastIndexOf('.'));
                    if(this.setFilter(Data) === data) {
                        return Data;
                    } else {
                        throw new Error('Your data has been tampered with in the session storage.');
                    }
                }
            } else {
                // use cryptographic algorithm;secret to encode the stored data
                var algorithm = filter[0],
                    secret = (new Buffer(filter[1], 'binary')).toString('binary')
                    ;
                this.setFilter = function(data) {
                    var cipher = Crypto.createCipher(algorithm, secret);
                    return Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]).toString('base64');
                };
                this.getFilter = function(data) {
                    var decipher = Crypto.createDecipher(algorithm, secret);
                    return Buffer.concat([decipher.update(new Buffer(data, 'base64')), decipher.final()]).toString();
                };
            }
        }
    };
    util.inherits(SecuRediStore, StoreClass);
    SecuRediStore.describe = function() {return config;};
    SecuRediStore.prototype.get = function(sessionId, callback) {
        var key = this. prefix + sessionId;
        this.redis.get(key, function(error, data) {
            if(error) {
                return callback(error);
            }
            if(!data) {
                return callback();
            }
            var session = {};
            try {
                session = JSON.parse(data.toString());
            } catch (error) {
                return callback(error);
            }
            return callback(null, session);
        });
    };

    SecuRediStore.prototype.set = function(sessionId, session, callback) {
        if(!sessionId || typeof (session) !== typeof ({})) {
            throw new Error('Invalid session set called ('+sessionId+'): ' + JSON.stringify(session) + '. Expecting (sessionId):sessionObject');
        }
        var key = this. prefix + sessionId,
        value = JSON.stringify(session);
        this.redis.setex(key, this.ttl, value, function(error, reply) {
            if(error) {
                return callback && callback(error) || (function(){throw new Error("Got error " + error)})();
            }
            if(!reply) {
                return callback && callback(error) || (function(){throw new Error('Got no error, but also no reply')})();
            }
            if(reply === redisOK) {
                return callback ? callback(null, session) : session;
            } else {
                throw new Error("Expecting '"+redisOK+"' on success, but got '"+reply+"'.");
            }
        });

    };




    return  {
        getStore: function(options){return new SecuRediStore(options)},
        describe: SecuRediStore.describe
    }
}


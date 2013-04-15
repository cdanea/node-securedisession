/**
 * User: ciprian
 * Author: Ciprian Danea <ciprian@danea.ro>
 * Date: 4/15/13
 * Time: 5:55 PM
 */
var AStorage = require('./abstract.store.js').StorageWrap,
    inherits = require('util').inherits,
    _ = require('underscore'),
    MCAdapter = function(options) {
        this.options = options;
        AStorage.apply(this, [options]);
        this.client = require('mc').Client(this.options.host);
    };
inherits(MCAdapter, AStorage);
MCAdapter.prototype.write = function(key, value, cb) {
    this.client.setex(key, this.options.ttl, value, cb);
};

MCAdapter.prototype.read = function(key, cb) {
    this.client.get(key, cb);
};

MCAdapter.prototype.del = function(key, cb) {
    this.client.del(key, cb);
};


module.exports = function(Store) {
    var RedisAdapterStore = function(options) {
        this.options = options;
        MCAdapter.apply(this, [options]);
        Store.apply(this);
    };
    inherits(RedisAdapterStore, Store);
    inherits(RedisAdapterStore, MCAdapter);
    return RedisAdapterStore;
};

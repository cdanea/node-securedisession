/**
 * User: ciprian
 * Author: Ciprian Danea <ciprian@danea.ro>
 * Date: 4/15/13
 * Time: 5:59 PM
 */



var _ = require('underscore'), config = {ttl: 86400, prefix: 'sess_'},
    AbstractStore = function(options) {
        var configs = _.extend(config, options), self = this;
        var getSessionId = function(sid) {return configs.prefix + sid};
        this.set = function (key, value, cb) {
            return this.write(getSessionId(key), this.encode(value), cb);
        };
        this.get = function (key, cb) {
            return this.read(getSessionId(key),
                function(error, data) {
                    data = self.decode(data);
                    return cb.apply(null, [error, data]);
                }
            );
        };
        this.destroy = function(key, cb) {
            return this.del(getSessionId(key), cb);
        };
    };
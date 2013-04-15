/**
 * User: ciprian
 * Author: Ciprian Danea <ciprian@danea.ro>
 * Date: 4/15/13
 * Time: 5:59 PM
 */

var _ = require('underscore'), config = {ttl: 86400, prefix: 'sess_'},
    AbstractStore = function(options) {
        this.options = options;
//        console.log(['o', this.options]);
        var self = this;
        var getSessionId = function(sid) {return self.options.prefix + sid};
        this.set = function (key, value, cb) {
            return self.write(
                getSessionId(key),
                self.encode && self.encode(value) || value,
                cb
            );
        };
        this.get = function (key, cb) {
            return this.read(getSessionId(key),
                function(error, data) {
                    data = self.decode ? self.decode(data) : data;
                    cb(error, data);
                }
            );
        };
        this.destroy = function(key, cb) {
            return this.del(getSessionId(key), cb);
        };
    };

module.exports.StorageWrap = AbstractStore;

//module.exports.StorageCodec = function(options, commFilters) {
//
//    var self = this, encodeValue = function() {
//        return function(value){
//            if(commFilters.encode) {
//                return commFilters.encode(value);
//            } else if(options.filter && options.filter.toString()) {
//                var filter = options.filter.toString().split(';');
//                if(filter.length == 1) {
//                    //just sign
//                    var secret = options.filter;
//                    this.setFilter = function(data) {
//                        return data + '.' + Crypto.createHmac('RSA-SHA256', secret).update(data).digest('base64').replace(/\=+$/, '');
//                    };
//                    this.getFilter = function(data) {
//                        var Data = data.slice(0, data.lastIndexOf('.'));
//                        if(this.setFilter(Data) === data) {
//                            return Data;
//                        } else {
//                            throw new Error('Your data has been tampered with in the session storage.');
//                        }
//                    };
//                } else {
//                    // use cryptographic algorithm;secret to encode the stored data
//                    var algorithm = filter[0],
//                        secret = (new Buffer(filter[1], 'binary')).toString('binary');
//                    this.setFilter = function(data) {
//                        var cipher = Crypto.createCipher(algorithm, secret);
//                        return Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]).toString('base64');
//                    };
//                    this.getFilter = function(data) {
//                        var decipher = Crypto.createDecipher(algorithm, secret);
//                        return Buffer.concat([decipher.update(new Buffer(data, 'base64')), decipher.final()]).toString();
//                    };
//                }
//            } else {
//                return value;
//            }
//        };
//    };
//    return {
//        encode: encodeValue(),
//        decode: decodeValue()
//    };
//}
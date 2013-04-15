/**
 * User: ciprian
 * Author: Ciprian Danea <ciprian@danea.ro>
 * Date: 4/15/13
 * Time: 10:49 AM
 */
var
    _ = require('underscore'),
    md5 = function(string) {return require('crypto').createHash('md5').update(string).digest("hex");},
    ksort = function(object){return _.object(_.sortBy(Object.keys(object), function(value) {return value;}), _.sortBy(object, function(value, key) {return key;}));},
    debug = require('debug')('connect:session:store:redistore')
;



module.exports = function(connect) {
    /**
     * label => object
     * @type {{}}
     */

    var stores = {}, Store;
    if(connect && connect.session && connect.session.Store) {
        Store = connect.session.Store;
    } else {
        Store = require('connect').session.Store;
    }
    var SecuRediStore = require('./securedistore.class.js')(Store);

    var storeFactory = function(options, label) {
        if(!label) {
            if(typeof  options === typeof 'string') {
                label = options;
            } else {
                label = md5(JSON.stringify(ksort(options)));
            }
        }
        if(!stores[label]) {
            stores[label] = SecuRediStore.getStore(options);
        }
        return stores[label];
    };

    return {
        create: storeFactory,
        list: function() {
            return Object.keys(stores);
        },
        use: function(label) {
            return stores[label];
        },
        util: {
            md5: md5,
            ksort:ksort
        }
    };
};
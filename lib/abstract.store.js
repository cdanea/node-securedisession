/**
 * User: ciprian
 * Author: Ciprian Danea <ciprian@danea.ro>
 * Date: 4/15/13
 * Time: 5:59 PM
 */



var _ = require('underscore'), config = {ttl: 86400, prefix: 'sess_'},
    AbstractStore = function(options){
        var options = _.extend(config, options);
        this.write = function(){};

    };
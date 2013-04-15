/**
 * User: ciprian
 * Author: Ciprian Danea <ciprian@danea.ro>
 * Date: 4/12/13
 * Time: 12:15 PM
 */
require('chai').should();
describe("Test SecuRediSession", function() {
    var Store = require('connect').session.Store,
        EventEmitter = require('events').EventEmitter,
        SecuRediStore = require('../lib/securedistore.class.js')(Store);

    it("should be a redis store", function(){
        SecuRediStore.should.have.property('getStore');
        SecuRediStore.getStore.should.be.a('function');
        SecuRediStore.getStore().should.be.a('object');
        SecuRediStore.getStore().should.be.instanceOf(Store);
        SecuRediStore.getStore().should.be.instanceOf(EventEmitter);
    });
    var ciphers = ['aes256', 'des', 'des3', 'blowfish', 'cast-cbc', 'cast', '', null],
        secrets = ['secreT', 'othe432453fdf', '    really big 082329087423908472098347   |||| ++__ \\\\\\\\~~~~~~~\'"-----  ', '', null],
        texts = ['text1', '0212121212', JSON.stringify({a:1,c:2})]
    ;
    it("Should be a proper encoder", function(){
        var arg = null;
        ciphers.forEach(function (cipher) {
            secrets.forEach(function (secret) {
                texts.forEach(function (text) {
                    if(cipher || secret) {
                        arg = {filter:cipher + ";" + secret};
                    } else {
                        arg = null;
                    }
                    var store = SecuRediStore.getStore();
                    text.should.equal(store.getFilter(store.setFilter(text)));
                });
            });
        });
    });
    it("Should contain a mapping object", function(){
        SecuRediStore.describe().should.be.an('object').with.property('socket_nodelay');
    });
    var filters = [null, 'secretSignKey', 'aes256;verySecretKey'], rs, i=0;
    filters.forEach(function(value){
        it("Should store into Redis", function(done){
            var dummy = {test:'value', 'stuff': 'other value', filter: value};
            rs = SecuRediStore.getStore(value?{filter:value}:{});
            rs.set('ceva' + (++i), dummy, function(error, reply){
                reply.should.deep.equal(dummy);
                done();
            });
        });

    });
});
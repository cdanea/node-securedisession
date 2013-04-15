/**
 * Created with JetBrains WebStorm.
 * User: ciprian
 * Date: 4/15/13
 * Time: 10:37 PM
 * To change this template use File | Settings | File Templates.
 */
var chai = require('chai'),
    expect = chai.expect;
chai.should();
var
    Store = require('connect').session.Store,
    RedisStore = require('../lib/redistorage.js'),
    RedisStoreWrap = RedisStore(Store),
    options = {ttl: 86400, prefix: 'thesession_'},
    options2 = {ttl: 86400, prefix: 'thesession2_'},
    codec = {encode: function(value){return value + ';' + value}, decode: function(value){return value.split(';')[0];}},
    rediStoreCodec = new RedisStoreWrap(options),
    rediStoreCodec2 = new RedisStoreWrap(options2)
;
describe("Test wrap", function() {
    it("Codec setter should work.", function(done) {
        rediStoreCodec.set("my-abstract-test", "value1", function(err, reply) {
            describe("Test wrap in redis with dummy codec", function() {
                it("We should find the key in the server", function(final) {
                    var cl = require('redis').createClient();
                    reply.should.equal('OK');
                    expect(err).to.be.not.ok;
                    cl.get('thesession_my-abstract-test', function(err, data) {
                        data.should.equal("value1" || codec.encode("value1"));
                        final(err, data);
                    });
                });
            });
            done(err, reply);
        });
    });
    it("Codec getter should work!", function() {
        rediStoreCodec.get("my-abstract-test", function(err, data) {
            describe("Test wrap in redis with dummy codec", function() {
                it("Should find the stuff in redis", function(done) {
                    expect(data).to.be.ok;
                    expect(err).to.be.not.ok;
                    data.should.equal("value1");
                    done(err, data);
                });
            });
        });
    });
    it("Direct setter should work", function(done) {
        rediStoreCodec2.set("my-abstract-test1", "value2", function(err, reply) {
            expect(reply).to.equal('OK');
            expect(err).to.be.not.ok;
            describe("Test wrap in redis with no codec", function() {
                it("We should find the key in the server", function(final) {
                    var cl = require('redis').createClient();
                    cl.get('thesession2_my-abstract-test1', function(err, data) {
                        data.should.equal("value2");
                        final(err, data);
                    });
                });
            });
            done(err, reply);
        });
    });
    it("Simple getter should work!", function() {
        rediStoreCodec2.get("my-abstract-test1", function(err, data){
            describe("Test wrap get from redis with no codec", function() {
                it("Must get the correct value", function(done){
                    expect(data).to.be.ok;
                    expect(err).to.be.not.ok;
                    data.should.equal("value2");
                    done(err, data);
                });
            });
        });
    });
});

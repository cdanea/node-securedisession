/**
 * User: ciprian
 * Author: Ciprian Danea <ciprian@danea.ro>
 * Date: 4/10/13
 * Time: 5:32 PM
 */
require('chai').should();
describe("Test RediSession", function() {
    var client;
    before(function(){
        var redisFactory = require('../');
        client = redisFactory.createClient();
        var s = new redisFactory.RedisSession({ceva:1});
        //console.log(s);
        //console.log(new redisFactory.RedisSession({ceva:2}));
    });
    it("Get a redis client", function(){
        client.should.be.a('object');
    });
});


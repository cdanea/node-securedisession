/**
 * User: ciprian
 * Author: Ciprian Danea <ciprian@danea.ro>
 * Date: 4/15/13
 * Time: 11:03 AM
 */
var chai = require('chai'),
    expect = chai.expect;
chai.should();

describe("The RediStore module should be a collection of utilities meant to help use the same redis server across multiple nodes of the same application",
    function(){
        var connect = require('connect');
        var rediStoreFactory = require('../lib/securedistore.js')(connect);
        it("Contains the correct utilities", function(){
            rediStoreFactory.should.be.an('object');

            rediStoreFactory.should.have.property('util');
            rediStoreFactory.util.should.be.a('object');
            rediStoreFactory.util.should.have.property('md5');
            rediStoreFactory.util.should.have.property('ksort');
            rediStoreFactory.util.md5.should.be.a('function');
            rediStoreFactory.util.ksort.should.be.a('function');

            rediStoreFactory.should.have.property('create');
            rediStoreFactory.create.should.be.a('function');
            rediStoreFactory.should.have.property('list');
            rediStoreFactory.list.should.be.a('function');
            rediStoreFactory.should.have.property('use');
            rediStoreFactory.use.should.be.a('function');
            var options = {opt: {fff:3}, a:2, b:0};
            var rs = rediStoreFactory.create(options),
                rs_label = rediStoreFactory.create('theLabelInsteadOfTheOptions'),
                rs_labelAndOpts = rediStoreFactory.create({opt:1}, 'theLabelAndTheOptions');

            // test inheritance
            rs.should.be.instanceOf(connect.session.Store);
            rs_label.should.be.instanceOf(connect.session.Store);
            rs_labelAndOpts.should.be.instanceOf(connect.session.Store);

            // test the list
            rediStoreFactory.list().should.be.an('array').with.length(3);
            rediStoreFactory.list().should.contain('theLabelInsteadOfTheOptions');
            rediStoreFactory.list().should.contain('theLabelAndTheOptions');
            var label = rediStoreFactory.util.md5(JSON.stringify(rediStoreFactory.util.ksort(options)));
            rediStoreFactory.list().should.contain(label);


        });
    }
);
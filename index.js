/**
 * User: ciprian
 * Author: Ciprian Danea <ciprian@danea.ro>
 * Date: 4/10/13
 * Time: 6:13 PM
 */
module.exports.Session = require('./lib/securedisession.js');
module.exports.Store = require('./lib/securedistore.js')(require('connect').session.Store);

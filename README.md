Secure Redis Sessions for connect/express
==============================

## SYNOPSIS
Small module that provides a connect/express session store with a Redis backend.

By default the module is just a session store, but ideally it should be used with data signing or even data encryption enabled.
Assuming you use a shared or exposed Redis backend, or even need to comply with PCIs that forbid you or your co-developers to actually see user private data, you'll eventually need some sort of encryption, or at the very least make sure the session data hasn't been tampered with.

### Data signing will protect against malicious session injection or forgery.
### Data encryption will also protect against data access.

##  Sample
    var connect = require('connect'),
        secuRediStore = require('securedistore')(connect);

    var noSigningOrEncryption = secuRediStore.create(); // default run-of-the-mill connect session middleware with redis
    var myBlogSessions = secuRediStore.create('blog');  // same as above, but this will provide a sanboxing and subsequent requests for 'blog' will return the same instanc
    var signedRedisStore = secuRediStore.create({filter: "secretSigningKey"}); // will add signing to your stored sessions
    var encryptedRedisStore = secuRediStore.create({filter: "des3;secretEncryptionPassword"}); // will add encryption to your stored sessions
    console.log(secuRediStore.describe()); // will print out some docs about the available options that the store constructor accepts

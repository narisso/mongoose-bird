'use strict';

var fixtures = require('./fixtures'),
  customMapper = function (name) {
    return name + 'Async';
  },
  mongoose = require('../libs/mongoose_bird')(require('mongoose')),
  Schema = mongoose.Schema,
  UserSchema = new Schema({
    name: String
  }),
  UserModel = mongoose.model('User', UserSchema),
  PostSchema = new Schema({
    title: String,
    author: {type: Schema.Types.ObjectId, ref: 'User'}
  }),
  PostModel,
  MONGOOSE_MODEL_STATICS = [
    // mongoose.Model static
    'remove', 'ensureIndexes', 'find', 'findById', 'findOne', 'count', 'distinct',
    'findOneAndUpdate', 'findByIdAndUpdate', 'findOneAndRemove', 'findByIdAndRemove',
    'create', 'update', 'mapReduce', 'aggregate', 'populate',
    // mongoose.Document static
    'update'
  ],
  MONGOOSE_MODEL_METHODS = [
    // mongoose.Model instance
    'save', 'remove',
    // mongoose.Document instance
    'populate', 'update', 'validate'
  ],
  MONGOOSE_QUERY_METHODS = [
    // mongoose.Query instance
    'find', 'exec', 'findOne', 'count', 'distinct', 'update', 'remove',
    'findOneAndUpdate', 'findOneAndRemove', 'lean', 'limit', 'skip', 'sort'
  ];

PostSchema.plugin(function (schema) {
  schema.pre('save', function (next) {
    console.log('*** pre save', this);
    schema.__test.ok(true);
    next();
  });
  schema.post('save', function (doc) {
    console.log('*** post save', doc);
    schema.__test.ok(doc);
  });
}, {});

PostModel = mongoose.model('Post', PostSchema);

module.exports = {
  setUp: function (callback) {
    var fixturesLoader = require('pow-mongodb-fixtures').connect('test');
    fixturesLoader.clearAndLoad(fixtures, function (err) {
      if (err) {
        console.log('error on clearAndLoad err: ' + err);
        throw err;
      }
      fixturesLoader.client.close();
      mongoose.connect('mongodb://localhost/test');
      callback();
      //console.log('clearAndLoad conected');
    });
  },
  tearDown: function (callback) {
    mongoose.disconnect();
    callback();
  },
  test_modelStatics: function (test) {
    MONGOOSE_MODEL_STATICS.forEach(function (funcName) {
      console.log('test_modelStatics: ' + funcName);
      test.equal(typeof UserModel[customMapper(funcName)], 'function');
    });
    test.done();
  },
  test_modelMethods: function (test) {
    var model = new UserModel();
    MONGOOSE_MODEL_METHODS.forEach(function (funcName) {
      console.log('test_modelMethods: ' + funcName);
      test.equal(typeof model[customMapper(funcName)], 'function');
    });
    test.done();
  },
  test_queryInstances: function (test) {
    var query = UserModel.find();
    MONGOOSE_QUERY_METHODS.forEach(function (funcName) {
      console.log('test_queryInstances: ' + funcName);
      test.equal(typeof query[customMapper(funcName)], 'function');
    });
    test.done();
  },
  test_findById__and__populate: function (test) {
    PostSchema.__test = test;

    console.log('test_findById__and__populate');

    PostModel.findByIdAsync(fixtures.posts.p1._id)
      .then(function (result) {
        test.ok(result);
        return result.populateAsync('author');
      })
      .then(function (result) {
        console.log('test_findById__and__populate -> Model#populate-->', result);
        test.ok(result);
        return result;
      })
      .then(function(result){
        return test.done();
      })
      .catch(test.ifError);
  },
  test_findById__and__exec: function (test) {
    PostSchema.__test = test;
    PostModel
      .findById(fixtures.posts.p1._id)
      .execAsync()
      .then(function (result) {
        console.log('test_findById__and__exec -> Model.findById and Query#exec-->', result);
        test.ok(result);

        return result;
      })
      .then(function (result) {
        test.done();
      })
      .catch(function(err){
        test.ifError(err);
      });
  },
  test_create: function (test) {
    UserModel
      .createAsync({name:'hello'}, {name:'world'})
      .then(function (createdUsers) {
        console.log('test_create -> created users:', arguments);
        test.equal(createdUsers.length, 2);
        test.equal(createdUsers[0].name, 'hello');
        test.equal(createdUsers[1].name, 'world');
      })
      .then(function (result) {
        test.done();
      })
      .catch(function (err) {
        console.log(err);
        test.ifError(err);
      });
  },
  test_create_spread: function (test) {
    UserModel
      .createAsync({name:'hello spread'}, {name:'world spread'})
      .spread(function (createdUser1, createdUser2) {
        console.log('created users:', arguments);
        test.equal(createdUser1.name, 'hello spread');
        test.equal(createdUser2.name, 'world spread');
      })
      .then(test.done)
      .catch(function (err) {
        console.log(err);
        test.ifError(err);
      });
  },
  test_update_spread: function (test) {
    PostSchema.__test = test;
    PostModel
      .updateAsync({_id: fixtures.posts.p1._id}, { title: 'changed'})
      .spread(function (affectedRows, raw) {
        console.log('Model.update-->', arguments);
        test.equal(affectedRows, 1);
        test.ok(raw);
      })
      .then(test.done)
      .catch(function (err) {
        console.log(err);
        test.ifError(err);
      });
  },
  test_save: function (test) {
    PostSchema.__test = test;
    var post = new PostModel();
    post.title = 'new-title';
    post.author = fixtures.users.u1._id;
    test.ok(post.isNew);
    post.saveAsync()
        .spread(function (result, affectedRows) {// with 'spread' options
        console.log('Model#save-->', arguments);
        test.ok(result);
        test.equal(affectedRows, 1);
        test.ok(!result.isNew);
        test.ok(result._id);
        test.equal(result.title, 'new-title');
        test.equal(result.author.toString(), fixtures.users.u1._id.toString());
      })
      .then(test.done)
      .catch(function (err) {
        console.log(err);
        test.ifError(err);
      });
  },
  test_issue2: function (test) {
    UserModel
      .findByIdAsync(fixtures.users.u1._id)
      .then(function (user) {
        return [ user, PostModel.find().populate('author').execAsync() ];
      })
      .spread(function (user, users) {
        console.log('user:', user);
        console.log('users:', users);
        test.ok(user);
        test.ok(users);
      })
      .then(function (result) {
        test.done();
      })
      .catch(function (err) {
        console.log(err);
        test.ifError(err);
      });
  }
};

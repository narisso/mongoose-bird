mongoose-bird
==========

[blue bird](https://github.com/petkaantonov/bluebird) support for [mongoose](http://mongoosejs.com).

based on [mongoose-2](https://github.com/iolo/mongoose-q).


What is it?
-----
mongoose-bird uses the bluebird's Promise.promisifyAll function which will
add a Async function for each function on mongoose :
 * mongoose.Model
 * mongoose.Model.prototype
 * mongoose.Query.prototype

So all mongoose-bird does it to call:
```javascript
 Promise.promisifyAll(mongoose.Model);
 Promise.promisifyAll(mongoose.Model.prototype);
 Promise.promisifyAll(mongoose.Query.prototype);
```

usage
-----

```javascript
var mongoose = require('mongoose-bird')(require('mongoose'));
// verbose way: mongooseQ is unused
var mongoose = require('mongoose'),
    mongooseBird = require('mongoose-bird')(mongoose)
// shortest way: mongoose will be loaded by mongoose-bird
var mongoose = require('mongoose-bird')();
```

* use Async `model` statistics functions:

```javascript
SomeModel.findByIdAsync(....blahblah...)
  .then(function (result) { ... })
  .catch(function (err) { ... });
```

* use Async `model` functions:

```javascript
var someModel = new SomeModel(...);
someModel.populateAsync()
  .then(function (result) { ... })
  .catch(function (err) { ... });
```

* use Async `query` methods:

```javascript
SomeModel.find(...).where(...).skip(...).limit(...).sort(...).populate(...)
  .execAsync() // no 'Async' suffix for model statics except for execAsync()
  .then(function (result) { ... })
  .catch(function (err) { ... });
```

* to use Async with `spread`:

```javascript
var mongoose = require('mongoose-bird')(require('mongoose'));
SomeModel.updateAsync(...)
  .spread(function (affectedRows, raw) { ... })
  .catch(function (err) { ... });
...
var model = new SomeModel();
...
model.saveAsync()
  .spread(function (savedDoc, affectedRows) { ... })
  .catch(function (err) { ... });
...
```

* to define custom statics/instance methods using Async

```javascript
SomeSchema.statics.findByName = function (name) {
  return this.findAsync({name: name}); // NOTE: returns Promise object.
};
...
var SomeModel = mongoose.model('Some', SomeSchema);
SomeModel.findByName('foo').then(function(result) {
  console.log(result);
});
```
> NOTE: this is not a feature of mongoose-bird

That's all folks!

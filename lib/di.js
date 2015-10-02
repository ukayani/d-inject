'use strict';
let _ = require('lodash');
let assert = require('assert-plus');

// TODO we should make use of https://github.com/angular/di.js/tree/master/example/node
// Note: do not create circular dependencies

function Injector() {

  this.di = {};
  this.cache = {};
}

/**
 * Retrieve a dependency from the container, create it if its not present in cache
 * @param name
 * @returns {*}
 */
function getDependency(name) {

  if (this.cache.hasOwnProperty(name)) {
    return this.cache[name];
  } else {
    assert.func(this.di[name], 'No dependency: ' + name);
    this.cache[name] = this.di[name]();
  }

  return this.cache[name];
}

/**
 * Given a unique name and a factory function that produces an instance, register the dependency with the container
 * @param name
 * @param factoryFn - should return an instance of the dependency being registered
 */
function setDependency(name, factoryFn) {
  if (this.di.hasOwnProperty(name)) {
    throw new Error('Dependency already exists with name: ' + name);
  }
  this.di[name] = factoryFn;
}

/**
 * Inject dependencies into the target
 * @param target
 * @returns {*}
 */
function inject(target) {
  assert.func(target, 'target is not a function');

  let deps = {};

  // get the specified dependency names
  let names = Array.prototype.slice.call(arguments, 1);
  names = _.flatten(names, true);

  let self = this;

  names.forEach(function each(name) {
    deps[name] = self.get(name);
  });

  return target(deps);

}

Injector.prototype.get = getDependency;
Injector.prototype.set = setDependency;
Injector.prototype.inject = inject;

module.exports = {
  createInjector: function () {
    return new Injector();
  }
};

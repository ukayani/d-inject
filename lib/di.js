'use strict';
let _ = require('lodash');
let assert = require('assert-plus');

// TODO we should make use of https://github.com/angular/di.js/tree/master/example/node
// Note: do not create circular dependencies

let di = {};
let cache = {};

/**
 * Retrieve a dependency from the container, create it if its not present in cache
 * @param name
 * @returns {*}
 */
function getDependency(name) {

  if (cache.hasOwnProperty(name)) {
    return cache[name];
  } else {
    assert.func(di[name], 'No dependency: ' + name);
    cache[name] = di[name]();
  }

  return cache[name];
}

/**
 * Given a unique name and a factory function that produces an instance, register the dependency with the container
 * @param name
 * @param factoryFn - should return an instance of the dependency being registered
 */
function setDependency(name, factoryFn) {
  if (di.hasOwnProperty(name)) {
    throw new Error('Dependency already exists with name: ' + name);
  }
  di[name] = factoryFn;
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

  names.forEach(function each(name) {
    deps[name] = getDependency(name);
  });

  return target(deps);

}

module.exports = {
  get: getDependency,
  inject: inject,
  set: setDependency
};

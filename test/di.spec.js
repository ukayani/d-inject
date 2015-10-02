'use strict';
let expect = require('chai').expect;
let di = require('../lib/di');
let sinon = require('sinon');

describe('di', function () {

  it('.set and .get', function () {

    let injector = di.createInjector();

    function dep() {
      return {name: 'Bob'};
    }

    injector.set('depA', dep);

    let depObj = injector.get('depA');

    expect(depObj.name).to.equal('Bob');

  });

  it('.set existing dependency', function () {

    let injector = di.createInjector();

    function depD() {
      return {name: 'D'};
    }

    injector.set('depD', depD);

    function setDupDependency() {
      injector.set('depD', function () {
      });
    }

    expect(setDupDependency).to.throw('Dependency already exists with name: depD');

  });

  it('.inject', function () {

    let injector = di.createInjector();

    function depB() {
      return {name: 'DepB'};
    }

    injector.set('depB', depB);

    function depC(deps) {
      expect(deps.depB.name).to.equal('DepB');
      return {
        name: 'Bob'
      };
    }

    let obj = injector.inject(depC, 'depB');
    expect(obj.name).to.equal('Bob');

  });

  it('.get should return cached dependency', function () {

    let injector = di.createInjector();

    let spy = sinon.spy(function () {
      return {name: 'dep'};
    });

    injector.set('stub', spy);

    let obj = injector.get('stub');
    let obj2 = injector.get('stub');

    expect(obj.name).to.equal('dep');
    expect(obj2.name).to.equal('dep');
    expect(obj).to.equal(obj2);

    // should only call our factory method once
    expect(spy.calledOnce).to.be.ok;

  });

});

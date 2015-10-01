'use strict';
let expect = require('chai').expect;
let di = require('../lib/di');
let sinon = require('sinon');

describe('di', function () {

  it('.set and .get', function () {

    function dep() {
      return {name: 'Bob'};
    }

    di.set('depA', dep);

    let depObj = di.get('depA');

    expect(depObj.name).to.equal('Bob');

  });

  it('.set existing dependency', function () {

    function depD() {
      return {name: 'D'};
    }

    di.set('depD', depD);

    function setDupDependency() {
      di.set('depD', function () {
      });
    }

    expect(setDupDependency).to.throw('Dependency already exists with name: depD');

  });

  it('.inject', function () {

    function depB() {
      return {name: 'DepB'};
    }

    di.set('depB', depB);

    function depC(deps) {
      expect(deps.depB.name).to.equal('DepB');
      return {
        name: 'Bob'
      };
    }

    let obj = di.inject(depC, 'depB');
    expect(obj.name).to.equal('Bob');

  });

  it('.get should return cached dependency', function () {

    let spy = sinon.spy(function () {
      return {name: 'dep'};
    });

    di.set('stub', spy);

    let obj = di.get('stub');
    let obj2 = di.get('stub');

    expect(obj.name).to.equal('dep');
    expect(obj2.name).to.equal('dep');
    expect(obj).to.equal(obj2);

    // should only call our factory method once
    expect(spy.calledOnce).to.be.ok;

  });

});

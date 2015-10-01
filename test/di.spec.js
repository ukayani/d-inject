'use strict';
let expect = require('chai').expect;
let di = require('../lib/di');
let sinon = require('sinon');

describe('di', function () {

  it('.set and .get', function () {

    di.reset();

    function dep() {
      return {name: 'Bob'};
    }

    di.set('depA', dep);

    let depObj = di.get('depA');

    expect(depObj.name).to.equal('Bob');

  });

  it('.set existing dependency', function () {

    di.reset();

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

    di.reset();

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

    di.reset();

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

  it('.reset should remove single dependencies', function () {

    di.reset();

    function depA() {
      return {name: 'A'};
    }

    function depB() {
      return {name: 'B'};
    }

    di.set('depA', depA);
    di.set('depB', depB);

    // lets make sure this dependency gets cached
    let depAObj1 = di.get('depA');
    expect(depAObj1.name).to.equal('A');

    di.reset('depA');
    di.reset('depB');

    di.set('depA', depA);
    di.set('depB', depB);

    let depAObj2 = di.get('depA');
    expect(depAObj2.name).to.equal('A');
    let depBObj = di.get('depB');
    expect(depBObj.name).to.equal('B');

  });

});

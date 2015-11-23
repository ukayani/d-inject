# d-inject
[![Dependency Status](https://david-dm.org/ukayani/d-inject.svg)](https://david-dm.org/ukayani/d-inject)
[![Build Status](https://travis-ci.org/ukayani/d-inject.svg?branch=master)](https://travis-ci.org/ukayani/d-inject)

## Overview
d-inject is an opinionated way to manage and organize dependencies in Node.JS projects. This project has been inspired by Java dependency injection libraries like Google Guice and Spring Framework. This uses the singleton pattern along with lazy-loading for efficiency.

## Explanation
<strong>createInjector</strong> creates a dependency injection container for you to manage dependencies. You can have many dependency injection containers

<strong>get</strong> will get a dependency from the DI container. We call get with a string representing the name of the dependency and it will return back the value (object) associated with that key (string).

<strong>set</strong> will set a dependency into the DI container. set takes two arguments. The name of the dependency and the (factory) <strong>function that produces the object</strong>. Note that this little detail allows us to implement lazy loading (so we don't load it until we absolutely have to - a technique taken from functional data structures for infinite sequences). 

<strong>inject</strong> is a convenience method. The first argument is a function (single argument) that takes in dependencies as its arguments, the rest of the arguments (variadic) are the dependency names that the function requires as arguments. The Dependency Injection mechanism will inspect the dependencies that the function requires, create an object with the dependencies as properties and call the function with its arguments and returns it.

## Examples

Let's look at some ways that this library can be used. 
Say I have a function with dependencies
```
a.js
----
function doSomething(arg) {
 return arg.hello('How are you');
}

function a(deps) {
    assert(deps != null);
    assert(deps.b != null);
    return doSomething(b);
}

module.exports = a;
```

As you can see the `function a`, has a dependency on `b`. If `b` is not present then `a` cannot work. Let's say that `b` looks like this
```
b.js
----
module.exports = function(greeting) {
    console.log('------');
    console.log(greeting);
    console.log('------');
};
```

There are two ways we can use the `d-inject` library to make our lives easier. Let's see one way to do it. This is commonly used when dependencies can only be inferred at runtime. These examples are written using ECMAScript 6

```
main.js
-------
let a = require('./a');
let b = require('./b');
let injectorInstance = require('d-inject).createInjector();

// lets load b into the injector, I can retrieve it by asking the injector for bInstance
injectorInstance.set('bInstance', function() { return b });

// note a relies on b, I can go to the dependency injection container and ask for b
let configuredA = injectorInstance.inject(a, 'bInstance');

// let's inject the configuredA object into the container instance
injectorInstance.set('aInstance', function() { return configuredA });

configuredA.doSomething('Hello');
# ------
# Hello
# ------
```

This was a simple example to illustrate the functionality. Let's take a look at something you are likely to encounter when using this in your projects

```
controller.js
-------------
function controller(deps) {

  assert.object(deps.service, 'service is missing');
  
  return function(req, res, next) {
    let id = req.params.id;
    //using dependency here
    let result = service.get(id);
    res.send({'result': result});
  }
}

module.exports = controller;
```

```
service.js
-------------
function service(deps) {
  assert.object(deps.runtimeDep, 'runtimeDep is missing');
  
  //getFromDbSync implementation not shown
  
  return function(id) {
    //using dependency here
    return getFromDbSync(id, deps.runtimeDep);
  }
}

module.exports = service;
```

So `service` has a runtime dependency. However, `controller` knows ahead of time that it needs `service` as its direct dependency. <strong>We can configure what we know ahead of time but we won't execute it until runtime when we have all our dependencies</strong>

```
configureAOT.js
---------------

function register(diContainer) {
    function controller() {
        let controllerClass = require('./controller');
        return diContainer.inject(controllerClass, 'service');
    }
    
    // registration 
    // remember we use factory functions to enable lazy-loading
    diContainer.set('controller', controller); 
}

module.exports = register;
```

Note we did not configure service as it has a runtime dependency.

Let's say we are running our application so you can see how runtime dependencies are being set

```
main.js
-------
let injectorInstance = require('d-inject).createInjector();

let dbInfo = process.env.DBINFO;    //runtime dependency (obtain DBINFO from environment variable)

// configure service now that we have the runtime information
let service = require('./service');

// configure service (at runtime)
injectorInstance.set('service', function() { service({runtimeDep: dbInfo}); })

// now call register
let staticDeps = require('./configureAOT');
staticDeps(injectorInstance);

// now everything is configured!
// remember controller returns a function that handles requests
http.createServer(injectorInstance.get('controller'));  
server.listen();
```

This made our code simpler. We were able to hook up dependencies in an organized fashion. 

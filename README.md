# d-inject

## Overview
d-inject is an opinionated way to manage and organize dependencies in Node.JS projects. This project has been inspired by Java dependency injection libraries like Google's Guice and Spring Framework. This uses the singleton pattern along with lazy-loading for efficiency.

## Explanation
<strong>createInjector</strong> creates a dependency injection container for you to manage dependencies. You can have many dependency injection containers

<strong>get</strong> will get a dependency from the DI container. We call get with a string representing the name of the dependency and it will return back the value (object) associated with that key (string).

<strong>set</strong> will set a dependency into the DI container. set takes two arguments. The name of the dependency and the (factory) <strong>function that produces the object</strong>. Note that this little detail allows us to implement lazy loading (so we don't load it until we absolutely have to - a technique taken from functional data structures for infinite sequences). 

<strong>inject</strong> is a convenience method. The first argument is a function (single argument) that takes in dependencies as its arguments, the rest of the arguments (variadic) are the dependency names that the function requires as arguments. The Depndency Injection mechanism will inspect the dependencies that the function requires, create an object with the dependencies as properties and call the function with its arguments and returns it.

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
```

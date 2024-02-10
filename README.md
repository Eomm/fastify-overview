# fastify-overview

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![ci](https://github.com/Eomm/fastify-overview/actions/workflows/ci.yml/badge.svg)](https://github.com/Eomm/fastify-overview/actions/workflows/ci.yml)
[![runkit](https://img.shields.io/badge/try%20on-runkit-blue)](https://runkit.com/eomm/fastify-overview-readme)

Get a complete overview of your fastify application!  
It gives you a tree structure to understand all the relations between your routes and plugins.

It tracks:

- 🛣 **ALL** the Fastify routes
- 🍱 **ALL** the Fastify plugins
- 🎨 **ALL** the Fastify decorators
- 🪝 **ALL** the Fastify hooks

Doing so you will get a complete overview of your application and you can:

- optimize your code
- optimize your application structure
- find out the application structure (especially if you have joined a new team)
- automate some documentation tasks

This plugin is intended to be run only for _development_ purposes.


### Visualize the structure

This plugin provides a detailed data structure of your application. To be able to visualize it, use this plugin together with [`fastify-overview-ui`](https://github.com/nearform/fastify-overview-ui), be sure to check it out!


## Install

```
npm install fastify-overview
```

### Compatibility

| Plugin version | Fastify version |
| ------------- |:---------------:|
| `^1.0.0` | `^3.0.0` |
| `^2.0.0` | `^3.0.0` |
| `^3.0.0` | `^4.0.0` |


## Usage

This plugin is super simple, just add it to your fastify instance and you will get a `overview()` method that will return a tree structure of your application.

There are 3 things to know:

1. It starts tracking your application after the `await register()` of the plugin:
    - what happens before, it is **not** tracked. So **this plugin must be the first one** to be registered.
    - it the `register` is not awaited, the structure will **not** be tracked.
2. The application structure can be accessed **after** the Fastify instance is `ready`. If you try to get it before the `ready` status, you will get an error.
3. The structure tracks hooks' name and decorators' name. If you use arrow functions the structure will be useless/unreadable.

Here the code:

```js
const fastify = require('fastify')

async function run() {
  const app = fastify()

  // await the plugin registration!
  await app.register(require('fastify-overview'))

  // create your application as usual
  app.addHook('onSend', function hookRoot () {})
  app.register(function register1 (instance, opts, next) {
    instance.addHook('onRequest', function hook1 () {})
    instance.register(function register2 (sub, opts, next) {
      sub.addHook('onRequest', function hook2 () {})
      next()
    })
    next()
  })

  // read your application structure when fastify is ready
  app.addHook('onReady', function showStructure (done) {
    const appStructure = app.overview() // 🦄 Here is the magic!
    console.log(JSON.stringify(appStructure, null, 2))
    done(null)
  })

  await app.listen(3000)
}
run()
```


### Structure

The JSON structure returned by the `overview` method is like the following:

```js
{
  "id": 0.331, // an internal id number. You can use it to identify the node
  "name": "pluginName", // the name of the plugin | app.register(function pluginName (){})
  "children": [ // the children of the fastify instance | instance.register(function subPlugin (){})
    // it contains the same structure we are describing
  ], 
  "decorators": { // all the instance decorators | app.decorate('foo-bar', 42)
    "decorate": [ { "name": "foo-bar", "type": "number" } ], // the decorators' name
    "decorateRequest": [], // app.decorateRequest('foo-bar', 42)
    "decorateReply": [] // app.decorateReply('foo-bar', 42)
  },
  "hooks": { // all the instance hooks
    "onRequest": [
      {
        "name": "hook1" // the function name: app.addHook('onRequest', function hook1 (){})
        "hash": "92b002434cd5d8481e7e5562b51df679e2f8d586" // the function hash. Useful to identify optimizations
      }
    ],
    "preParsing": [],
    "preValidation": [],
    "preHandler": [],
    "preSerialization": [],
    "onError": [],
    "onSend": [],
    "onResponse": [],
    "onTimeout": [],
    "onListen": [],
    "onReady": [],
    "onClose": [],
    "onRoute": [],
    "onRegister": []
  },
  "routes": [ // an array within all the routes in that fastify context
    {
      "method": "GET",
      "url": "/prefix/hello", // the complete route's url
      "prefix": "/prefix", // the plugin prefix
      "hooks": { // the hooks that are registered in that single route using the route's options
        "onRequest": [],
        "preParsing": [],
        "preValidation": [
          {
            "name": "Anonymous function",
            "hash": "ade00501a7c8607ba74bf5e13d751da2139c4e60"
          }
        ],
        "preHandler": [
          {
            "name": "hook1",
            "hash": "9398f5df01879094095221d86a544179e62cee12"
          }
        ],
        "preSerialization": [],
        "onError": [],
        "onSend": [],
        "onResponse": [],
        "onTimeout": []
      }
    }
  ]
}
```

Notice that an hook that appears in the parent node, is inherited by the children but it is not listed in the 
children's hooks node.

You can see the previous code output running it on RunKit: [![runkit](https://img.shields.io/badge/try%20on-runkit-blue)](https://runkit.com/eomm/fastify-overview-readme)


## Options

You can pass the following options to the plugin or to the decorator:

```js
app.register(require('fastify-overview'), {
  addSource: true, // default: false
  exposeRoute: true, // default: false
  exposeRouteOptions: {
    method: 'POST', // default: 'GET'
    url: '/customUrl', // default: '/json-overview'
  }, 
  onRouteDefinition: (opts) => {
    return {
      schema: opts.schema
    }
  }, 
  onDecorateDefinition: (decoratorType, decoratorName, decoratorValue) => {
     if (value && typeof value === 'object' && !Array.isArray(value)) {
        return {
           staticData: true
        }
     }
     return { utilityFunction: true }
  }
})

const appStructure = app.overview({
  hideEmpty: true, // default: false
  routesFilter: function (routeItem) {
    return routeItem.method.toLowerCase() !== 'get'
  }
})
```

### addSource

Optionally the plugin adds a `source` property to each node of the tree.
Here an example of the structure with the `addSource` option:

```json
{
  "name": "hook1",
  "hash": "31d31d981f412085927efb5e9f36be8ba905516a",
  "source": {
    "stackIndex": 0,
    "fileName": "/user/foo/project/bar/test/sources/app.js",
    "relativeFileName": "test/sources/app.js",
    "lineNumber": 34,
    "columnNumber": 11,
    "functionName": "register3",
    "typeName": null,
    "methodName": null
  }
}
```

### hideEmpty

To keep the structure light and clean, you can hide empty properties by providing this option to the `overview` decorator.
For example, if you do not have any decorator, the `decorators` property will not be present in the structure.

The properties that can be hidden are:
- `decorators` and/or its children
- `hooks` and/or its children
- `routes`

You can get both the structure by calling the `overview` method twice:

```js
const fullStructure = app.overview()
const lightStructure = app.overview({
  hideEmpty: true, // default: false
})
```

Here an example of the cleaned output:

```json
{
  "id": 0.38902288100060645,
  "name": "fastify -> fastify-overview",
  "children": [
    {
      "id": 0.7086786379705781,
      "name": "function (instance, opts, next) { next() }"
    },
    {
      "id": 0.6405610832733726,
      "name": "async function (instance, opts) { -- instance.register(async function (instance, opts) {",
      "children": [
        {
          "id": 0.8200459678409413,
          "name": "async function (instance, opts) { -- instance.decorateReply('oneRep', {})",
          "decorators": {
            "decorateReply": [
              { "name": "oneRep", "type": "object" }
            ]
          }
        }
      ]
    }
  ],
  "hooks": {
    "onRequest": [
      {
        "name": "hook1",
        "hash": "31d31d981f412085927efb5e9f36be8ba905516a"
      }
    ]
  }
}
```

### routesFilter

You can decide which routes to keep based on the predicate provided in the 'routesFilter' property:

```js
app.overview({
  hideEmpty: true,
  routesFilter: function (routeItem) {
    return routeItem.method.toLowerCase() !== 'get'
  }
})
```


### exposeRoute

Optionally, you can expose a route that will return the JSON structure.
This parameter accepts a boolean value.
By default the route is exposed at `GET /json-overview`.

> Note that if you need to call the route when the host is not localhost, you will need to setup 
> the [`@fastify/cors`](https://github.com/fastify/fastify-cors/) plugin.

### exposeRouteOptions

You can customize the route's options when `exposeRoute` is set to `true`.
You can provide all the [fastify route's options](https://www.fastify.io/docs/latest/Reference/Routes/#routes-options) except the `handler`.

### onRouteDefinition

This option can be used to determine which properties of the route options are additional included in the overview. 
The function receives the [RouteOptions](https://github.com/fastify/fastify/blob/62f564d965949bc123184a27a610f214f23e9a49/types/hooks.d.ts#L695) 
object as the only parameter and must return an object with the desired properties. You can also overwrite the properties 
that are included in the route overview by default (namely `url`, `method`, `prefix` and `hooks`). You cannot
override the `source` property.
```js
 onRouteDefinition: (routeOptions) => {
   return {
     method: routeOptions.method,
     url: routeOptions.url.length,
     prefix: routeOptions.prefix,
     schema: routeOptions.schema
   }
 }
```
In this example, the `url` property is overridden and the `url` length is returned instead of the `url`.

### onDecorateDefinition

Similar to `onRouteDefinition`, this option allows you to control which information about decorators is included in the overview.
The passed function is called for `instance`, `request` and `reply` decorators but the decorator type is passed to the function as parameter.
The default properties `name` and `type` can also be overwritten here. See the table below for an overview of exactly 
how the function `onDecorateDefinition(decoratorType, decoratorName, decoratorValue)` is called for the different decorators.

|                 Decorator                 | decoratorType   | decoratorName | decoratorValue    |
|:-----------------------------------------:|-----------------|---------------|-------------------|
| `app.decorate('db', {query: () => {}})`   | decorate        | db            | {query: () => {}} |
| `app.decorateRequest('verify', () => {})` | decorateRequest | verify        | () => {}          |
| `app.decorateReply('num', 42)`            | decorateReply   | num           | 42                |

As an example, the function below returns the nested properties for object values.
```js
onDecorateDefinition: (type, name, value) => {
   if (value && typeof value === 'object' && !Array.isArray(value)) {
      return {
         recursive: Object.entries(value).map(([key, val]) => {
            return {
               name: key,
               type: Array.isArray(val) ? 'array' : typeof val
            }
         })
      }
   } else {
      return {}
   }
}
```

## License

Copyright [Manuel Spigolon](https://github.com/Eomm), Licensed under [MIT](./LICENSE).

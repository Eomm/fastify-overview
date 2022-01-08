'use strict'

module.exports = function pluginC (f, opts, next) {
  f.get('/c', (request, reply) => {
    reply.send({ exports: 'default' })
  })

  next()
}

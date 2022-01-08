'use strict'

module.exports = function pluginB (f, opts, next) {
  f.get('/b', (request, reply) => {
    reply.send({ exports: 'default' })
  })

  next()
}

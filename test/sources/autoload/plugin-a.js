'use strict'

module.exports.default = function (f, opts, next) {
  f.get('/a', (request, reply) => {
    reply.send({ exports: 'default' })
  })

  next()
}

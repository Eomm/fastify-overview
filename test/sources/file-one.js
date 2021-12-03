'use strict'

const fileTwo = require('./file-two')

module.exports = function fileOne (instance, opts, next) {
  instance.decorate('fileOne', 'fileOne')
  instance.decorateRequest('fileOne', 'fileOne')
  instance.decorateReply('fileOne', 'fileOne')

  instance.get('/file-one', {
    preHandler: function fileOnePreHandlerHook (request, reply, done) {
      done(null)
    },
    onSend: [
      function fileOneOnSendHook (request, reply, payload, done) {
        // If you change the payload, you may only change it to a string, a Buffer, a stream, or null.
        done(null, 'newPayload')
      }
    ]
  }, function fileOneHandler (req, res) {})

  instance.addHook('preHandler', function hook (request, reply, done) {
    done(null)
  })

  instance.register(fileTwo)

  next()
}

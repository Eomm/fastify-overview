'use strict'

module.exports = function fileTwo (instance, opts, next) {
  instance.decorate('fileTwo', 'fileTwo')
  instance.decorateRequest('fileTwo', 'fileTwo')
  instance.decorateReply('fileTwo', 'fileTwo')

  instance.get('/file-one', {
    preHandler: function fileTwoPreHandlerHook (request, reply, done) {
      done(null)
    },
    onSend: [
      function fileTwoOnSendHook (request, reply, payload, done) {
        // If you change the payload, you may only change it to a string, a Buffer, a stream, or null.
        done(null, 'newPayload')
      }
    ]
  }, function fileTwoHandler (req, res) {})

  instance.addHook('preHandler', function hook (request, reply, done) {
    done(null)
  })
  next()
}

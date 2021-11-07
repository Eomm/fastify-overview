'use strict'

module.exports.getEmptyTree = function getEmptyTree (name) {
  return {
    name,
    children: [],
    decorators: {
      decorate: [],
      decorateRequest: [],
      decorateReply: []
    },
    hooks: {
      onRequest: [],
      preParsing: [],
      preValidation: [],
      preHandler: [],
      preSerialization: [],
      onError: [],
      onSend: [],
      onResponse: [],
      onTimeout: [],
      onReady: [],
      onClose: [],
      onRoute: [],
      onRegister: []
    }
  }
}

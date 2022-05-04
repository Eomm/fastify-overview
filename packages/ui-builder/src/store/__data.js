export default {
  name: 'plugin-auto-0 -> fastify-overview',
  children: [
    {
      name: '/Users/mspigolon/workspace/covid-green-backend-api/node_modules/fastify-swagger/lib/routes.js',
      children: [],
      decorators: {
        decorate: [],
        decorateRequest: [],
        decorateReply: ['sendFile', 'download']
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
        onReady: ['Anonymous function'],
        onClose: [],
        onRoute: [],
        onRegister: []
      }
    }
  ],
  decorators: {
    decorate: ['swagger', 'swaggerCSP', 'jwt', 'pg'],
    decorateRequest: [
      'corsPreflightEnabled',
      'authenticate',
      'user',
      'jwtVerify',
      'pg',
      'verify'
    ],
    decorateReply: ['jwtSign']
  },
  hooks: {
    onRequest: ['Anonymous function', 'Anonymous function'],
    preParsing: [],
    preValidation: [],
    preHandler: [],
    preSerialization: [],
    onError: [],
    onSend: ['Anonymous function'],
    onResponse: ['Anonymous function'],
    onTimeout: [],
    onReady: ['hook'],
    onClose: ['Anonymous function', 'Anonymous function'],
    onRoute: ['Anonymous function', 'Anonymous function', 'Anonymous function'],
    onRegister: ['Anonymous function']
  }
}

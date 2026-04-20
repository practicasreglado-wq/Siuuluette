export default async function (fastify, opts) {
  fastify.get('/', async (request, reply) => {
    return { ok: true, module: 'generic' }
  })
}

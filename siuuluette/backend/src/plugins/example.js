import fp from 'fastify-plugin';

export default fp(async (fastify, opts) => {
  // Add your plugins here
  fastify.decorate('utility', () => {
    return 'useful helper';
  });
});

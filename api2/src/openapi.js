/** BONUS: OpenAPI spec (Swagger). COMMIT: Member 4 only — API2 owner. */
export const openApiSpec = {
  openapi: '3.0.3',
  info: { title: 'Orders API (API2)', version: '1.0.0', description: 'Orders microservice with Redis queue' },
  paths: {
    '/health': {
      get: { summary: 'Health check', responses: { 200: { description: 'OK' } } }
    },
    '/orders': {
      get: { summary: 'List orders', responses: { 200: { description: 'List of orders' } } },
      post: {
        summary: 'Create order',
        requestBody: { content: { 'application/json': { schema: { type: 'object', required: ['product_id'], properties: { product_id: { type: 'integer' }, quantity: { type: 'integer', default: 1 } } } } } },
        responses: { 201: { description: 'Created' } }
      }
    },
    '/orders/{id}': {
      delete: {
        summary: 'Delete order by id',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Deleted' }, 404: { description: 'Not found' } }
      }
    },
    '/orders/events': {
      get: { summary: 'Recent order events (from Redis queue)', responses: { 200: { description: 'List of events' } } }
    }
  }
}

/** BONUS: OpenAPI spec (Swagger). COMMIT: Member 3 only — API1 owner. */
export const openApiSpec = {
  openapi: '3.0.3',
  info: { title: 'Products API (API1)', version: '1.0.0', description: 'Products microservice' },
  paths: {
    '/health': {
      get: { summary: 'Health check', responses: { 200: { description: 'OK' } } }
    },
    '/products': {
      get: { summary: 'List products', responses: { 200: { description: 'List of products' } } },
      post: {
        summary: 'Create product',
        requestBody: { content: { 'application/json': { schema: { type: 'object', required: ['name', 'price'], properties: { name: { type: 'string' }, price: { type: 'number' } } } } } },
        responses: { 201: { description: 'Created' } }
      }
    },
    '/products/{id}': {
      delete: {
        summary: 'Delete product by id',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Deleted' }, 404: { description: 'Not found' } }
      }
    }
  }
}

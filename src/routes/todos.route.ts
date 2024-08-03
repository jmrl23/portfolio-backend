import { caching, memoryStore } from 'cache-manager';
import type { FastifyRequest } from 'fastify';
import { asRoute } from '../lib/common';
import {
  responseTodoOKSchema,
  responseTodosOKSchema,
  TodoCreate,
  todoCreateSchema,
  TodoDelete,
  todoDeleteSchema,
  TodoGet,
  todoGetAllSchema,
  todoGetSchema,
  TodoUpdate,
  todoUpdateSchema,
} from '../schemas/todo';
import CacheService from '../services/CacheService';
import TodoService from '../services/TodoService';

export const prefix = '/todos';

export default asRoute(async function todosRoute(app) {
  const cache = await caching(memoryStore({ ttl: 0 }));
  const cacheService = new CacheService(cache);
  const todoService = new TodoService(cacheService);

  app

    .route({
      method: 'POST',
      url: '/create',
      schema: {
        description: todoCreateSchema.description,
        tags: ['todos'],
        body: todoCreateSchema,
        response: {
          200: responseTodoOKSchema,
        },
      },
      async handler(request: FastifyRequest<{ Body: TodoCreate }>) {
        const { content } = request.body;
        const todo = await todoService.createTodo(content);
        return {
          todo,
        };
      },
    })

    .route({
      method: 'GET',
      url: '',
      schema: {
        description: todoGetAllSchema.description,
        tags: ['todos'],
        response: {
          200: responseTodosOKSchema,
        },
      },
      async handler() {
        const todos = await todoService.getTodos();
        return {
          todos,
        };
      },
    })

    .route({
      method: 'GET',
      url: '/:id',
      schema: {
        description: todoGetSchema.description,
        tags: ['todos'],
        params: todoGetSchema,
        response: {
          200: responseTodoOKSchema,
        },
      },
      async handler(request: FastifyRequest<{ Params: TodoGet }>) {
        const { id } = request.params;
        const todo = await todoService.getTodo(id);
        return {
          todo,
        };
      },
    })

    .route({
      method: 'PATCH',
      url: '/update',
      schema: {
        description: todoUpdateSchema.description,
        tags: ['todos'],
        body: todoUpdateSchema,
        response: {
          200: responseTodoOKSchema,
        },
      },
      async handler(request: FastifyRequest<{ Body: TodoUpdate }>) {
        const { id, content, done } = request.body;
        const todo = await todoService.updateTodo(id, content, done);
        return {
          todo,
        };
      },
    })

    .route({
      method: 'DELETE',
      url: '/delete/:id',
      schema: {
        description: todoDeleteSchema.description,
        tags: ['todos'],
        params: todoDeleteSchema,
        response: {
          200: responseTodoOKSchema,
        },
      },
      async handler(request: FastifyRequest<{ Params: TodoDelete }>) {
        const { id } = request.params;
        const todo = await todoService.deleteTodo(id);
        return {
          todo,
        };
      },
    });
});

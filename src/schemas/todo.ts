import type { FromSchema } from 'json-schema-to-ts';
import { asJsonSchema } from '../lib/common';

export const todoSchema = asJsonSchema({
  type: 'object',
  description: 'Todo item',
  additionalProperties: false,
  required: ['id', 'createdAt', 'updatedAt', 'content', 'done'],
  properties: {
    id: {
      type: 'string',
      format: 'uuid',
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
    },
    content: {
      type: 'string',
      examples: ['Walk the dog'],
    },
    done: {
      type: 'boolean',
      examples: [false],
    },
  },
});
export type Todo = FromSchema<typeof todoSchema>;

export const todoCreateSchema = asJsonSchema({
  type: 'object',
  description: 'Create new todo item',
  additionalProperties: false,
  required: ['content'],
  properties: {
    content: {
      type: 'string',
      minLength: 1,
      examples: ['Walk the dog'],
    },
  },
});
export type TodoCreate = FromSchema<typeof todoCreateSchema>;

export const todoGetAllSchema = asJsonSchema({
  type: 'object',
  description: 'Get todo items',
  additionalProperties: false,
});
export type TodoGetAll = FromSchema<typeof todoGetAllSchema>;

export const todoGetSchema = asJsonSchema({
  type: 'object',
  description: 'Get todo item',
  additionalProperties: false,
  required: ['id'],
  properties: {
    id: {
      type: 'string',
      format: 'uuid',
    },
  },
});
export type TodoGet = FromSchema<typeof todoGetSchema>;

export const todoUpdateSchema = asJsonSchema({
  type: 'object',
  description: 'Update todo item',
  additionalProperties: false,
  required: ['id'],
  properties: {
    id: {
      type: 'string',
      format: 'uuid',
    },
    content: {
      type: 'string',
      minLength: 1,
      examples: ['Walk the dog'],
    },
    done: {
      type: 'boolean',
      examples: [true],
    },
  },
});
export type TodoUpdate = FromSchema<typeof todoUpdateSchema>;

export const todoDeleteSchema = asJsonSchema({
  type: 'object',
  description: 'Delete todo item',
  additionalProperties: false,
  required: ['id'],
  properties: {
    id: {
      type: 'string',
      format: 'uuid',
    },
  },
});
export type TodoDelete = FromSchema<typeof todoDeleteSchema>;

export const responseTodoOKSchema = asJsonSchema({
  type: 'object',
  description: 'Response todo item',
  additionalProperties: false,
  required: ['todo'],
  properties: {
    todo: { ...todoSchema, nullable: true },
  },
});
export type ResponseTodoOK = FromSchema<typeof responseTodoOKSchema>;

export const responseTodosOKSchema = asJsonSchema({
  type: 'object',
  description: 'Response todo items',
  additionalProperties: false,
  required: ['todos'],
  properties: {
    todos: {
      type: 'array',
      items: todoSchema,
    },
  },
});
export type ResponseTodosOK = FromSchema<typeof responseTodosOKSchema>;

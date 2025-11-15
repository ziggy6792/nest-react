import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import request from 'supertest';
import { App } from 'supertest/types';

import * as schema from '../src/server/db/schema';
import { createTestApp, type TestApp } from './test-setup';

describe('UsersController (e2e)', () => {
  let testApp: TestApp;

  beforeAll(async () => {
    testApp = await createTestApp();
  });

  afterEach(async () => {
    // Clean up test data after each test
    await testApp.db.delete(schema.users);
  });

  afterAll(async () => {
    await testApp.cleanup();
  });

  describe('POST /users', () => {
    it('should create a new user', () => {
      const createUserDto = { name: 'John Doe' };

      return request(testApp.app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('name', 'John Doe');
          expect(res.body).toHaveProperty('capitalizedName', 'JOHN DOE');
          expect(res.body).toHaveProperty('createdAt');
          expect(res.body).toHaveProperty('updatedAt');
          expect(typeof res.body.id).toBe('number');
          expect(typeof res.body.createdAt).toBe('string');
          expect(typeof res.body.updatedAt).toBe('string');
        });
    });

    it('should reject creation with empty name', () => {
      const createUserDto = { name: '' };

      return request(testApp.app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(400);
    });

    it('should reject creation without name field', () => {
      return request(testApp.app.getHttpServer())
        .post('/users')
        .send({})
        .expect(400);
    });

    it('should reject creation with non-whitelisted properties', () => {
      const createUserDto = {
        name: 'John Doe',
        id: 999,
        createdAt: new Date().toISOString(),
      };

      return request(testApp.app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(400);
    });

    it('should reject creation with invalid name type', () => {
      return request(testApp.app.getHttpServer())
        .post('/users')
        .send({ name: 123 })
        .expect(400);
    });
  });

  describe('GET /users', () => {
    it('should return an empty array when no users exist', () => {
      return request(testApp.app.getHttpServer())
        .get('/users')
        .expect(200)
        .expect([]);
    });

    it('should return all users', async () => {
      // Create test users
      await testApp.db.insert(schema.users).values([
        { firstName: 'Alice', lastName: 'Smith' },
        { firstName: 'Bob', lastName: 'Johnson' },
      ]);

      return request(testApp.app.getHttpServer())
        .get('/users')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(2);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('name');
          expect(res.body[0]).toHaveProperty('capitalizedName');
          expect(res.body[0]).toHaveProperty('createdAt');
          expect(res.body[0]).toHaveProperty('updatedAt');
          expect(res.body[0].capitalizedName).toBe('ALICE SMITH');
          expect(res.body[1].capitalizedName).toBe('BOB JOHNSON');
        });
    });

    it('should return users in correct format', async () => {
      await testApp.db
        .insert(schema.users)
        .values({ firstName: 'Test', lastName: 'User' });

      return request(testApp.app.getHttpServer())
        .get('/users')
        .expect(200)
        .expect((res) => {
          expect(res.body[0]).toMatchObject({
            id: expect.any(Number),
            name: 'Test User',
            capitalizedName: 'TEST USER',
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          });
        });
    });
  });

  describe('GET /users/:id', () => {
    it('should return a user by id', async () => {
      const [user] = await testApp.db
        .insert(schema.users)
        .values({ firstName: 'Jane', lastName: 'Doe' })
        .returning();

      return request(testApp.app.getHttpServer())
        .get(`/users/${user.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject({
            id: user.id,
            name: 'Jane Doe',
            capitalizedName: 'JANE DOE',
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          });
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(testApp.app.getHttpServer())
        .get('/users/99999')
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toContain('not found');
        });
    });

    it('should return 400 for invalid id format', () => {
      return request(testApp.app.getHttpServer())
        .get('/users/invalid')
        .expect(400);
    });

    it('should return 404 for negative id (treated as valid integer)', () => {
      return request(testApp.app.getHttpServer()).get('/users/-1').expect(404);
    });
  });

  describe('Integration scenarios', () => {
    it('should create and then retrieve a user', async () => {
      // Create a user
      const createResponse = await request(testApp.app.getHttpServer())
        .post('/users')
        .send({ name: 'Integration Test User' })
        .expect(201);

      const userId = createResponse.body.id;

      // Retrieve the user
      return request(testApp.app.getHttpServer())
        .get(`/users/${userId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(userId);
          expect(res.body.name).toBe('Integration Test User');
          expect(res.body.capitalizedName).toBe('INTEGRATION TEST USER');
        });
    });

    it('should create multiple users and list them all', async () => {
      // Create multiple users
      await request(testApp.app.getHttpServer())
        .post('/users')
        .send({ name: 'User One' })
        .expect(201);

      await request(testApp.app.getHttpServer())
        .post('/users')
        .send({ name: 'User Two' })
        .expect(201);

      await request(testApp.app.getHttpServer())
        .post('/users')
        .send({ name: 'User Three' })
        .expect(201);

      // List all users
      return request(testApp.app.getHttpServer())
        .get('/users')
        .expect(200)
        .expect((res) => {
          expect(res.body.length).toBe(3);
          const names = res.body.map((u: { name: string }) => u.name);
          expect(names).toContain('User One');
          expect(names).toContain('User Two');
          expect(names).toContain('User Three');
        });
    });
  });
});

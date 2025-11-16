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
      const createUserDto = { firstName: 'John', lastName: 'Doe' };

      return request(testApp.app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('firstName', 'John');
          expect(res.body).toHaveProperty('lastName', 'Doe');
          expect(res.body).toHaveProperty('capitalizedName', 'JOHN DOE');
          expect(res.body).toHaveProperty('createdAt');
          expect(res.body).toHaveProperty('updatedAt');
          expect(typeof res.body.id).toBe('number');
          expect(typeof res.body.createdAt).toBe('string');
          expect(typeof res.body.updatedAt).toBe('string');
        });
    });

    it('should reject creation with empty firstName', () => {
      const createUserDto = { firstName: '', lastName: 'Doe' };

      return request(testApp.app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(400);
    });

    it('should reject creation with empty lastName', () => {
      const createUserDto = { firstName: 'John', lastName: '' };

      return request(testApp.app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(400);
    });

    it('should reject creation without firstName field', () => {
      return request(testApp.app.getHttpServer())
        .post('/users')
        .send({ lastName: 'Doe' })
        .expect(400);
    });

    it('should reject creation without lastName field', () => {
      return request(testApp.app.getHttpServer())
        .post('/users')
        .send({ firstName: 'John' })
        .expect(400);
    });

    it('should reject creation with non-whitelisted properties', () => {
      const createUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        id: 999,
        createdAt: new Date().toISOString(),
      };

      return request(testApp.app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(400);
    });

    it('should reject creation with invalid firstName type', () => {
      return request(testApp.app.getHttpServer())
        .post('/users')
        .send({ firstName: 123, lastName: 'Doe' })
        .expect(400);
    });

    it('should reject creation with invalid lastName type', () => {
      return request(testApp.app.getHttpServer())
        .post('/users')
        .send({ firstName: 'John', lastName: 123 })
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
          expect(res.body[0]).toHaveProperty('firstName');
          expect(res.body[0]).toHaveProperty('lastName');
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
            firstName: 'Test',
            lastName: 'User',
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
            firstName: 'Jane',
            lastName: 'Doe',
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

  describe('GET /users/findNames', () => {
    beforeEach(async () => {
      // Create test users for filtering tests
      await testApp.db.insert(schema.users).values([
        { firstName: 'John', lastName: 'Doe' },
        { firstName: 'Jane', lastName: 'Smith' },
        { firstName: 'Johnny', lastName: 'Johnson' },
        { firstName: 'Bob', lastName: 'Doe' },
      ]);
    });

    it('should filter users by firstName', async () => {
      return request(testApp.app.getHttpServer())
        .get('/users/findNames')
        .query({ firstName: 'John' })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(2);
          expect(res.body[0]).toHaveProperty('firstName');
          expect(res.body[0]).toHaveProperty('lastName');
          expect(res.body[0]).toHaveProperty('fullName');
          expect(res.body[0].firstName).toContain('John');
          expect(res.body[1].firstName).toContain('John');
        });
    });

    it('should filter users by lastName', async () => {
      return request(testApp.app.getHttpServer())
        .get('/users/findNames')
        .query({ lastName: 'Doe' })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(2);
          expect(res.body[0].lastName).toContain('Doe');
          expect(res.body[1].lastName).toContain('Doe');
        });
    });

    it('should filter users by both firstName and lastName', async () => {
      return request(testApp.app.getHttpServer())
        .get('/users/findNames')
        .query({ firstName: 'John', lastName: 'Doe' })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(1);
          expect(res.body[0].firstName).toBe('John');
          expect(res.body[0].lastName).toBe('Doe');
          expect(res.body[0].fullName).toBe('John Doe');
        });
    });

    it('should return all users when no filters provided', async () => {
      return request(testApp.app.getHttpServer())
        .get('/users/findNames')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(4);
          res.body.forEach(
            (user: {
              firstName: string;
              lastName: string;
              fullName: string;
            }) => {
              expect(user).toHaveProperty('firstName');
              expect(user).toHaveProperty('lastName');
              expect(user).toHaveProperty('fullName');
              expect(user.fullName).toBe(`${user.firstName} ${user.lastName}`);
            },
          );
        });
    });

    it('should return empty array when no matches found', async () => {
      return request(testApp.app.getHttpServer())
        .get('/users/findNames')
        .query({ firstName: 'NonExistent' })
        .expect(200)
        .expect([]);
    });

    it('should handle partial matches', async () => {
      return request(testApp.app.getHttpServer())
        .get('/users/findNames')
        .query({ firstName: 'Joh' })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(2);
          res.body.forEach((user: { firstName: string }) => {
            expect(user.firstName).toContain('Joh');
          });
        });
    });
  });

  describe('Integration scenarios', () => {
    it('should create and then retrieve a user', async () => {
      // Create a user
      const createResponse = await request(testApp.app.getHttpServer())
        .post('/users')
        .send({ firstName: 'Integration', lastName: 'Test' })
        .expect(201);

      const userId = createResponse.body.id;

      // Retrieve the user
      return request(testApp.app.getHttpServer())
        .get(`/users/${userId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(userId);
          expect(res.body.firstName).toBe('Integration');
          expect(res.body.lastName).toBe('Test');
          expect(res.body.capitalizedName).toBe('INTEGRATION TEST');
        });
    });

    it('should create multiple users and list them all', async () => {
      // Create multiple users
      await request(testApp.app.getHttpServer())
        .post('/users')
        .send({ firstName: 'User', lastName: 'One' })
        .expect(201);

      await request(testApp.app.getHttpServer())
        .post('/users')
        .send({ firstName: 'User', lastName: 'Two' })
        .expect(201);

      await request(testApp.app.getHttpServer())
        .post('/users')
        .send({ firstName: 'User', lastName: 'Three' })
        .expect(201);

      // List all users
      return request(testApp.app.getHttpServer())
        .get('/users')
        .expect(200)
        .expect((res) => {
          expect(res.body.length).toBe(3);
          const lastNames = res.body.map(
            (u: { lastName: string }) => u.lastName,
          );
          expect(lastNames).toContain('One');
          expect(lastNames).toContain('Two');
          expect(lastNames).toContain('Three');
        });
    });
  });
});

import "@testing-library/jest-dom";
import { setupServer } from "msw/node";
import { beforeAll, afterEach, afterAll } from "vitest";
import { getUsersMock } from "./api/generated/users/users.msw";
import { getAppMock } from "./api/generated/app/app.msw";
import { faker } from "@faker-js/faker";

// Seed faker for deterministic test results
faker.seed(123); // Use any fixed number

// Setup MSW server with auto-generated handlers
export const server = setupServer(...getUsersMock(), ...getAppMock());

// Establish API mocking before all tests
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

// Reset any request handlers that are declared as a part of our tests
// (i.e. for testing one-time error scenarios)
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished
afterAll(() => server.close());

import { describe, it, expect } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { queryClient } from "./query-client";

describe("query-client", () => {
  it("should create a QueryClient instance", () => {
    expect(queryClient).toBeInstanceOf(QueryClient);
  });

  it("should have default configuration", () => {
    expect(queryClient).toBeDefined();
    expect(queryClient.getQueryCache).toBeDefined();
    expect(queryClient.getMutationCache).toBeDefined();
  });
});


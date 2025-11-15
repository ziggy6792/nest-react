import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Creates a new QueryClient for each test to ensure isolation
 */
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries to prevent tests from timing out
      },
      mutations: {
        retry: false,
      },
    },
  });

/**
 * Renders a React component with QueryClientProvider wrapper
 * MSW handlers are automatically set up via test-setup.ts
 */
export const renderWithQueryClient = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) => {
  const queryClient = createTestQueryClient();

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

// Re-export everything from React Testing Library
export * from "@testing-library/react";

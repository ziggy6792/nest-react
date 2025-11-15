import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AddUser } from './AddUser';

// Mock the API module
vi.mock('../api', () => ({
  api: {
    users: {
      list: {
        queryKey: () => ['/users/list'],
      },
      add: {
        useMutation: vi.fn(),
      },
    },
  },
}));

describe('AddUser', () => {
  let queryClient: QueryClient;
  let mockMutateAsync: ReturnType<typeof vi.fn>;
  let mockInvalidateQueries: ReturnType<typeof vi.fn>;
  let mockUseMutation: ReturnType<typeof vi.fn>;
  let onSuccessCallback: (() => void) | undefined;

  beforeEach(async () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    mockMutateAsync = vi.fn().mockImplementation(async () => {
      const result = {
        id: 1,
        name: 'Test User',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };
      // Call onSuccess if it exists
      if (onSuccessCallback) {
        onSuccessCallback();
      }
      return result;
    });

    mockInvalidateQueries = vi.fn();
    queryClient.invalidateQueries = mockInvalidateQueries;

    mockUseMutation = vi.fn().mockImplementation((options?: { mutation?: { onSuccess?: () => void } }) => {
      // Store the onSuccess callback
      onSuccessCallback = options?.mutation?.onSuccess;
      return {
        mutateAsync: mockMutateAsync,
        isPending: false,
      };
    });

    const apiModule = await import('../api');
    vi.mocked(apiModule.api.users.add.useMutation).mockImplementation(mockUseMutation);
  });

  it('should render the form with input and button', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AddUser />
      </QueryClientProvider>
    );

    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });

  it('should allow typing in the input field', async () => {
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={queryClient}>
        <AddUser />
      </QueryClientProvider>
    );

    const input = screen.getByPlaceholderText('Name');
    await user.type(input, 'John Doe');

    expect(input).toHaveValue('John Doe');
  });

  it('should submit the form and call the mutation', async () => {
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={queryClient}>
        <AddUser />
      </QueryClientProvider>
    );

    const input = screen.getByPlaceholderText('Name');
    const button = screen.getByRole('button', { name: 'Add' });

    await user.type(input, 'Jane Smith');
    await user.click(button);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        data: { name: 'Jane Smith' },
      });
    });
  });

  it('should clear the input after successful submission', async () => {
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={queryClient}>
        <AddUser />
      </QueryClientProvider>
    );

    const input = screen.getByPlaceholderText('Name');
    const button = screen.getByRole('button', { name: 'Add' });

    await user.type(input, 'Test User');
    await user.click(button);

    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });

  it('should invalidate queries after successful submission', async () => {
    const user = userEvent.setup();
    render(
      <QueryClientProvider client={queryClient}>
        <AddUser />
      </QueryClientProvider>
    );

    const input = screen.getByPlaceholderText('Name');
    const button = screen.getByRole('button', { name: 'Add' });

    await user.type(input, 'New User');
    await user.click(button);

    await waitFor(() => {
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ['/users/list'],
      });
    });
  });

  it('should disable the button when mutation is pending', async () => {
    mockUseMutation.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <AddUser />
      </QueryClientProvider>
    );

    const button = screen.getByRole('button', { name: 'Add' });
    expect(button).toBeDisabled();
  });
});

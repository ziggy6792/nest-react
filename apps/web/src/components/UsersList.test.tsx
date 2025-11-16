import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithQueryClient } from '../test-utils/render';
import { UsersList } from './UsersList';
import { server } from '../test-setup';
import type { UserDetailsDto } from '../api/generated/client.schemas';
import { getUsersControllerFindAllMockHandler } from 'src/api/generated/users/users.msw';

describe('UsersList', () => {
  it('should display list of users', async () => {
    const mockUsers: UserDetailsDto[] = [
      {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        capitalizedName: 'JOHN DOE',
      },
      {
        id: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        createdAt: '2024-01-02T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
        capitalizedName: 'JANE SMITH',
      },
    ];

    server.use(getUsersControllerFindAllMockHandler(mockUsers));

    renderWithQueryClient(<UsersList />);

    // Wait for API call to complete
    await waitFor(
      () => {
        expect(screen.getByText(/John Doe/)).toBeInTheDocument();
        expect(screen.getByText(/Jane Smith/)).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });
});

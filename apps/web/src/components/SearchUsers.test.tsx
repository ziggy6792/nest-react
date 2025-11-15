import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithQueryClient } from '../test-utils/render';
import { SearchUsers } from './SearchUsers';
import { server } from '../test-setup';
import type { UserNameDetailsDto } from '../api/generated/client.schemas';
import { getUsersControllerFindNamesMockHandler } from 'src/api/generated/users/users.msw';

describe('SearchUsers', () => {
  it('should search and display users when typing in the search field', async () => {
    const mockUsers: UserNameDetailsDto[] = [
      {
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe',
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        fullName: 'Jane Smith',
      },
    ];

    // Override the default handler for this test
    server.use(getUsersControllerFindNamesMockHandler(mockUsers));

    const user = userEvent.setup();
    renderWithQueryClient(<SearchUsers />);

    const firstNameInput = screen.getByPlaceholderText('First Name (contains)');
    await user.type(firstNameInput, 'John');

    await waitFor(() => {
      expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Jane Smith').length).toBeGreaterThan(0);
    });
  });
});

import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithQueryClient } from '../test-utils/render';
import { SearchUsers } from './SearchUsers';
import { server } from '../test-setup';
import type { UserNameDetailsDto } from '../api/generated/client.schemas';
import { getUsersControllerFindNamesMockHandler } from 'src/api/generated/users/users.msw';

describe('SearchUsers', () => {
  it('should search and display users by firstName', async () => {
    const mockUsers: UserNameDetailsDto[] = [
      {
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe',
      },
    ];

    server.use(getUsersControllerFindNamesMockHandler(mockUsers));

    const user = userEvent.setup();
    renderWithQueryClient(<SearchUsers />);

    const firstNameInput = screen.getByPlaceholderText('First Name');
    await user.type(firstNameInput, 'John');

    // Wait for debounce and API call to complete
    await waitFor(
      () => {
        const results = screen.getAllByText('John Doe');
        expect(results.length).toBeGreaterThan(0);
      },
      { timeout: 2000 }
    );
  });
});

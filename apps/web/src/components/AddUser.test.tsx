import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithQueryClient } from '../test-utils/render';
import { AddUser } from './AddUser';
import { server } from '../test-setup';
import { getUsersControllerAddMockHandler } from '../api/generated/users/users.msw';
import type { UserDetailsDto } from '../api/generated/client.schemas';

describe('AddUser', () => {
  it('should render the form with input and button', () => {
    renderWithQueryClient(<AddUser />);

    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });

  it('should allow typing in the input field', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<AddUser />);

    const input = screen.getByPlaceholderText('Name');
    await user.type(input, 'John Doe');

    expect(input).toHaveValue('John Doe');
  });

  it('should submit the form and create user', async () => {
    const mockUser: UserDetailsDto = {
      id: 1,
      name: 'Jane Smith',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      capitalizedName: 'JANE SMITH',
    };

    // Override the default handler for this test (remove delay for faster tests)
    server.use(getUsersControllerAddMockHandler(mockUser));

    const user = userEvent.setup();
    renderWithQueryClient(<AddUser />);

    const input = screen.getByPlaceholderText('Name');
    const button = screen.getByRole('button', { name: 'Add' });

    await user.type(input, 'Jane Smith');
    await user.click(button);

    await waitFor(
      () => {
        expect(input).toHaveValue('');
      },
      { timeout: 2000 }
    );
  });

  it('should clear the input after successful submission', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<AddUser />);

    const input = screen.getByPlaceholderText('Name');
    const button = screen.getByRole('button', { name: 'Add' });

    await user.type(input, 'Test User');
    await user.click(button);

    await waitFor(
      () => {
        expect(input).toHaveValue('');
      },
      { timeout: 2000 }
    );
  });
});

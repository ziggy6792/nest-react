import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithQueryClient } from '../test-utils/render';
import { AddUser } from './AddUser';
import { server } from '../test-setup';
import type { UserDetailsDto } from '../api/generated/client.schemas';
import { getUsersControllerCreateMockHandler } from 'src/api/generated/users/users.msw';

describe('AddUser', () => {
  it('should render the form with input and button', () => {
    renderWithQueryClient(<AddUser />);

    expect(screen.getByPlaceholderText('First Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Last Name')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });

  it('should allow typing in the input field', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<AddUser />);

    const firstNameInput = screen.getByPlaceholderText('First Name');
    const lastNameInput = screen.getByPlaceholderText('Last Name');
    await user.type(firstNameInput, 'John');
    await user.type(lastNameInput, 'Doe');

    expect(firstNameInput).toHaveValue('John');
    expect(lastNameInput).toHaveValue('Doe');
  });

  it('should submit the form and create user', async () => {
    const mockUser: UserDetailsDto = {
      id: 1,
      firstName: 'Jane',
      lastName: 'Smith',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      capitalizedName: 'JANE SMITH',
    };

    // Override the default handler for this test (remove delay for faster tests)
    server.use(getUsersControllerCreateMockHandler(mockUser));

    const user = userEvent.setup();
    renderWithQueryClient(<AddUser />);

    const firstNameInput = screen.getByPlaceholderText('First Name');
    const lastNameInput = screen.getByPlaceholderText('Last Name');
    const button = screen.getByRole('button', { name: 'Add' });

    await user.type(firstNameInput, 'Jane');
    await user.type(lastNameInput, 'Smith');
    await user.click(button);

    await waitFor(
      () => {
        expect(firstNameInput).toHaveValue('');
        expect(lastNameInput).toHaveValue('');
      },
      { timeout: 2000 }
    );
  });

  it('should clear the input after successful submission', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<AddUser />);

    const firstNameInput = screen.getByPlaceholderText('First Name');
    const lastNameInput = screen.getByPlaceholderText('Last Name');
    const button = screen.getByRole('button', { name: 'Add' });

    await user.type(firstNameInput, 'Test');
    await user.type(lastNameInput, 'User');
    await user.click(button);

    await waitFor(
      () => {
        expect(firstNameInput).toHaveValue('');
        expect(lastNameInput).toHaveValue('');
      },
      { timeout: 2000 }
    );
  });
});

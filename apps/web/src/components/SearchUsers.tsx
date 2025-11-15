import { useState } from 'react';
import { api } from '../api';
import type { UserNameDetailsDto } from '../api/generated/client.schemas';

export function SearchUsers() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Only query when at least one field has a value
  const hasSearchCriteria = Boolean(firstName.trim() || lastName.trim());

  const { data, isLoading, isError } = api.users.findNames.useQuery(
    hasSearchCriteria
      ? {
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined,
        }
      : undefined,
    hasSearchCriteria
      ? {
          query: {
            enabled: true,
          },
        }
      : {
          query: {
            enabled: false,
          },
        }
  );

  return (
    <div>
      <h3>Search Users by Name</h3>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input type='text' value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder='First Name (contains)' style={{ padding: '0.5rem' }} />
        <input type='text' value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder='Last Name (contains)' style={{ padding: '0.5rem' }} />
      </div>

      {!hasSearchCriteria && <p style={{ color: '#666', fontStyle: 'italic' }}>Enter a first name or last name to search</p>}

      {isLoading && hasSearchCriteria && <div>Searching...</div>}
      {isError && <div style={{ color: 'red' }}>Error searching users</div>}

      {data && hasSearchCriteria && (
        <div>
          {data.length === 0 ? (
            <p style={{ color: '#666' }}>No users found</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {data.map((user: UserNameDetailsDto, index: number) => (
                <li
                  key={`${user.firstName}-${user.lastName}-${index}`}
                  style={{
                    padding: '0.5rem',
                    marginBottom: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                  }}>
                  <strong>{user.fullName}</strong>
                  <div style={{ fontSize: '0.9em', color: '#666' }}>
                    {user.firstName} {user.lastName}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

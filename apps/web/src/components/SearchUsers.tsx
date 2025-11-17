import { useState, useMemo, useEffect } from 'react';
import type { UserNameDetailsDto } from '../api/generated/client.schemas';
import api from 'src/api/api';

export function SearchUsers() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [debouncedFirstName, setDebouncedFirstName] = useState('');
  const [debouncedLastName, setDebouncedLastName] = useState('');

  // Debounce the search inputs
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFirstName(firstName);
    }, 300);
    return () => clearTimeout(timer);
  }, [firstName]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedLastName(lastName);
    }, 300);
    return () => clearTimeout(timer);
  }, [lastName]);

  // Build query params object, only including non-empty values
  const queryParams = useMemo(() => {
    const params: { firstName?: string; lastName?: string } = {};
    if (debouncedFirstName.trim()) {
      params.firstName = debouncedFirstName.trim();
    }
    if (debouncedLastName.trim()) {
      params.lastName = debouncedLastName.trim();
    }
    return Object.keys(params).length > 0 ? params : undefined;
  }, [debouncedFirstName, debouncedLastName]);

  const { data, isLoading, isError } = api.users.findNames.useQuery(queryParams, {
    query: {
      enabled: queryParams !== undefined, // Only fetch when there are search terms
    },
  });

  return (
    <div style={{ marginTop: '1rem' }}>
      <h3>Search Users</h3>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          type='text'
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder='First Name'
          style={{
            padding: '0.5rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
            minWidth: '150px',
          }}
        />
        <input
          type='text'
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder='Last Name'
          style={{
            padding: '0.5rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
            minWidth: '150px',
          }}
        />
        <button
          type='button'
          onClick={() => {
            setFirstName('');
            setLastName('');
            setDebouncedFirstName('');
            setDebouncedLastName('');
          }}
          style={{
            padding: '0.5rem 1rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: '#f5f5f5',
            cursor: 'pointer',
          }}>
          Clear
        </button>
      </div>

      {!queryParams && <div style={{ color: '#666', fontStyle: 'italic' }}>Enter a first name or last name to search</div>}

      {isLoading && queryParams && <div>Loading...</div>}
      {isError && <div style={{ color: 'red' }}>Error loading users</div>}

      {data && queryParams && (
        <div>
          {data.length === 0 ? (
            <div style={{ color: '#666', fontStyle: 'italic' }}>No users found matching your search</div>
          ) : (
            <div>
              <div style={{ marginBottom: '0.5rem', color: '#666' }}>
                Found {data.length} user{data.length !== 1 ? 's' : ''}
              </div>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {data.map((user: UserNameDetailsDto, index: number) => (
                  <li
                    key={`${user.firstName}-${user.lastName}-${index}`}
                    style={{
                      padding: '0.75rem',
                      marginBottom: '0.5rem',
                      border: '1px solid #e0e0e0',
                      borderRadius: '4px',
                      backgroundColor: '#fafafa',
                    }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1em' }}>{user.fullName}</div>
                    <div style={{ fontSize: '0.9em', color: '#666', marginTop: '0.25rem' }}>{user.fullName}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { users } from '../api';

export function AddUser() {
  const [name, setName] = useState('');

  // Use hooks directly - full type safety preserved
  const add = users.hooks.add.useMutation({
    onSuccess: () => {
      // tRPC-like utils: typed invalidation with extracted types
      users.utils.list.invalidate();
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        add.mutate({ body: { name } });
        setName('');
      }}>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder='Name' />
      <button type='submit' disabled={add.isPending}>
        Add
      </button>
    </form>
  );
}

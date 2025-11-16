import './styles.css';
import { UsersList } from '../components/UsersList';
import { UserById } from '../components/UserById';
import { AddUser } from '../components/AddUser';

function App() {
  return (
    <div className='container'>
      <h1 className='title'>
        Demo <br />
        <span>NestJs + React</span>
      </h1>
      <div style={{ marginTop: '2rem' }}>
        <h2>Users</h2>
        <UsersList />
        <div style={{ marginTop: '1rem' }}>
          <h3>User by ID (4)</h3>
          <UserById id='4' />
        </div>
        <div style={{ marginTop: '1rem' }}>
          <h3>Add User</h3>
          <AddUser />
        </div>
      </div>
    </div>
  );
}

export default App;

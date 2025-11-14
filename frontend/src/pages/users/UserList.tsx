import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Header } from '../../components/Header/Header';
import { Pagination } from '../../components/Pagination/Pagination'; 
import styles from './UserList.module.css';

interface UserData {
  id: string;
  email: string;
  vbucks: number;
}

interface PublicUser {
  id: string;
  email: string;
  vbucks: number;
}

interface ApiResponse {
  data: PublicUser[];
  currentPage: number;
  totalPages: number;
  totalUsers: number;
}

export function UserList() {
  const navigate = useNavigate();
  const [loggedInUser, setLoggedInUser] = useState<UserData | null>(null);
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setLoggedInUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`https://projeto-eso-fortnite-production.up.railway.app/api/users?page=${currentPage}&limit=10`);
        if (!res.ok) {
          throw new Error('Falha ao carregar a lista de usuários.');
        }
        const data: ApiResponse = await res.json();
        
        setUsers(data.data);
        setCurrentPage(data.currentPage);
        setTotalPages(data.totalPages);

      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Ocorreu um erro desconhecido.');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [currentPage]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setLoggedInUser(null);
    navigate('/login');
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const renderList = () => {
    if (loading) return <p className={styles.message}>Carregando usuários...</p>;
    if (error) return <p className={styles.message}>{error}</p>;
    if (users.length === 0) {
      return <p className={styles.message}>Nenhum usuário cadastrado.</p>;
    }

    return (
      <div className={styles.tableContainer}>
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>V-Bucks</th>
              <th>User ID</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <Link to={`/users/${user.id}`} className={styles.userLink}>
                    {user.email}
                  </Link>
                </td>
                <td>{user.vbucks.toLocaleString('pt-BR')}</td>
                <td>{user.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <>
      <Header userData={loggedInUser} onLogout={handleLogout} />
      <main className={styles.container}>
        <Link to="/" className={styles.backLink}>
          &larr; Voltar para a Loja
        </Link>
        <h1 className={styles.title}>Usuários Cadastrados</h1>
        
        {renderList()}
        
        {!loading && !error && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </main>
    </>
  );
}
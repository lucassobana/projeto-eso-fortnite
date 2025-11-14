import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Header } from '../../components/Header/Header';
import { SkinCard } from '../../components/SkinCard/SkinCard';
import styles from './UserProfile.module.css';

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

interface Item {
  id: string;
  name: string;
  description: string;
  type: string;
  rarity: string;
  imageUrl: string | null;
  price: number;
  isNew: boolean;
  isOnSale: boolean;
  added: string;
}

export function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [loggedInUser, setLoggedInUser] = useState<UserData | null>(null);
  const [profileUser, setProfileUser] = useState<PublicUser | null>(null);
  const [inventory, setInventory] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setLoggedInUser(JSON.parse(storedUser));
    }

    async function fetchProfileData() {
      if (!userId) {
        setError('ID de usuário não encontrado.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const [profileRes, inventoryRes] = await Promise.all([
          fetch(`https://projeto-eso-fortnite-production.up.railway.app/api/users/${userId}`),
          fetch(`https://projeto-eso-fortnite-production.up.railway.app/api/user/inventory/${userId}`)
        ]);

        if (!profileRes.ok) {
          throw new Error('Usuário não encontrado.');
        }
        if (!inventoryRes.ok) {
          throw new Error('Falha ao carregar o inventário deste usuário.');
        }

        const profileData: PublicUser = await profileRes.json();
        const inventoryData: Item[] = await inventoryRes.json();

        setProfileUser(profileData);
        setInventory(inventoryData);

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

    fetchProfileData();
  }, [userId]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setLoggedInUser(null);
    navigate('/login');
  };

  const renderContent = () => {
    if (loading) {
      return <p className={styles.message}>Carregando perfil...</p>;
    }
    if (error) {
      return <p className={styles.message}>{error}</p>;
    }
    if (inventory.length === 0) {
      return <p className={styles.message}>Este usuário não possui nenhum item.</p>;
    }
    return (
      <div className={styles.grid}>
        {inventory.map((item) => (
          <SkinCard
            key={item.id}
            name={item.name}
            rarity={item.rarity}
            price={item.price}
            imageUrl={item.imageUrl}
            isNew={item.isNew}
            isOnSale={item.isOnSale}
            owned={true}
            onClick={() => {}}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <Header userData={loggedInUser} onLogout={handleLogout} />
      <main className={styles.container}>
        <Link to="/users" className={styles.backLink}>
          &larr; Voltar para a Lista de Usuários
        </Link>
        <h1 className={styles.title}>
          Inventário de: {profileUser ? profileUser.email : '...'}
        </h1>
        
        {renderContent()}
      </main>
    </>
  );
}
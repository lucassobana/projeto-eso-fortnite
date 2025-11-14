import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Header } from '../../components/Header/Header';
import styles from './History.module.css';

interface UserData {
    id: string;
    email: string;
    vbucks: number;
}

interface CosmeticDetails {
    id: string;
    name: string;
    description: string | null;
    type: string | null;
    rarity: string | null;
    imageUrl: string | null;
    price: number;
    added: string;
}

interface UserDetails {
    email: string;
}

interface Transaction {
    id: string;
    type: 'COMPRA' | 'REEMBOLSO';
    amountVbucks: number;
    createdAt: string;
    cosmetic: CosmeticDetails;
    user: UserDetails;
}

export function History() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/login');
            return;
        }

        const user: UserData = JSON.parse(storedUser);
        setUserData(user);

        async function fetchHistory(userId: string) {
            setLoading(true);
            setError('');
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/history/${userId}`);
                if (!res.ok) {
                    throw new Error('Falha ao carregar o histórico.');
                }
                const data: Transaction[] = await res.json();
                setTransactions(data);
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

        fetchHistory(user.id);
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUserData(null);
        navigate('/login');
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    };

    const formatValue = (value: number, type: string) => {
        const prefix = type === 'COMPRA' ? '-' : '+';
        return `${prefix}${value.toLocaleString('pt-BR')}`;
    };

    const renderList = () => {
        if (loading) return <p className={styles.message}>Carregando histórico...</p>;
        if (error) return <p className={styles.message}>{error}</p>;
        if (transactions.length === 0) {
            return <p className={styles.message}>Nenhuma transação encontrada.</p>;
        }

        return (
            <div className={styles.listContainer}>
                {transactions.map((tx) => (
                    <div key={tx.id} className={styles.transactionItem}>
                        <img
                            src={tx.cosmetic.imageUrl || 'https://placehold.co/100x100/0b192c/fff?text=?'}
                            alt={tx.cosmetic.name}
                            className={styles.itemImage}
                        />
                        <div className={styles.itemContent}>
                            <h2 className={styles.itemTitle}>{tx.cosmetic.name}</h2>
                            <div className={styles.detailsGrid}>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Usuário:</span>
                                    <span className={styles.detailValue}>{tx.user.email.split('@')[0]}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Tipo:</span>
                                    <span className={styles.detailValue}>{tx.cosmetic.type || 'N/A'}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Data da Compra:</span>
                                    <span className={styles.detailValue}>
                                        {tx.type === 'COMPRA' ? formatDate(tx.createdAt) : '---'}
                                    </span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Conjunto:</span>
                                    <span className={styles.detailValue}>{tx.cosmetic.description || 'N/A'}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Data da Devolução:</span>
                                    <span className={styles.detailValue}>
                                        {tx.type === 'REEMBOLSO' ? formatDate(tx.createdAt) : '---'}
                                    </span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Adicionado em:</span>
                                    <span className={styles.detailValue}>{formatDate(tx.cosmetic.added)}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Valor:</span>
                                    <span className={`${styles.detailValue} ${tx.type === 'COMPRA' ? styles.valueCompra : styles.valueReembolso}`}>
                                        {formatValue(tx.amountVbucks, tx.type)}
                                    </span>
                                </div>
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Raridade:</span>
                                    <span className={styles.detailValue}>{tx.cosmetic.rarity || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <>
            <Header userData={userData} onLogout={handleLogout} />
            <main className={styles.container}>
                <Link to="/" className={styles.backLink}>
                    &larr; Voltar para a Loja
                </Link>
                <h1 className={styles.title}>Histórico</h1>
                {renderList()}
            </main>
        </>
    );
}
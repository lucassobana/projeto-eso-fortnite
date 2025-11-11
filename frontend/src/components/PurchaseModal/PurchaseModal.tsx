import styles from './PurchaseModal.module.css';
import logo from '../../assets/logo.png'; // Ajuste o caminho se o logo estiver noutro sítio

// --- Tipos ---
// Esta interface é usada pelo App.tsx e pelo Modal, por isso está exportada
export interface Skin {
    id: string;
    name: string;
    description: string;
    type: string;
    rarity: string;
    price: number;
    image: string | null; // Aceita string ou null
    isPurchased: boolean;
}

// --- Props ---
interface PurchaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    skin: Skin | null;
    userVBucks: number;
    onPurchase: (skin: Skin) => void;
    onRefund: (skin: Skin) => void;
}

// --- Componente usando o padrão "export function" ---
export function PurchaseModal({
    isOpen,
    onClose,
    skin,
    userVBucks,
    onPurchase,
    onRefund,
}: PurchaseModalProps) {
    // Se não estiver aberto ou não houver skin, não renderiza nada
    if (!isOpen || !skin) {
        return null;
    }

    // Variável para verificar se o utilizador pode comprar
    const canAfford = userVBucks >= skin.price;

    // Funções de clique internas que chamam as props
    const handlePurchase = () => {
        if (canAfford) {
            onPurchase(skin); // Chama a função que veio do App.tsx
        }
    };

    const handleRefund = () => {
        onRefund(skin); // Chama a função que veio do App.tsx
    };

    return (
        // Overlay (fundo escuro)
        <div className={styles.modalOverlay} onClick={onClose}>
            {/* Conteúdo do Modal (impede que o clique feche) */}
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                {/* Botão de Fechar 'X' */}
                <button className={styles.closeButton} onClick={onClose}>
                    &times;
                </button>

                <div className={styles.modalLayout}>
                    {/* Painel Esquerdo (Imagem) */}
                    <div className={styles.leftPanel}>
                        {/* Lógica para mostrar a imagem ou o logo de fallback */}
                        {skin.image ? (
                            <img src={skin.image} alt={skin.name} className={styles.skinImage} />
                        ) : (
                            <img src={logo} alt="Fallback" className={styles.skinImage} />
                        )}
                    </div>

                    {/* Painel Direito (Informações) */}
                    <div className={styles.rightPanel}>
                        <span className={styles.rarityTag}>{skin.rarity.toUpperCase()}</span>
                        {/* CORRIGIDO: Estava skin.skinName, agora é skin.name */}
                        <h1 className={styles.skinName}>{skin.name}</h1>
                        <p className={styles.skinDescription}>Description: {skin.description}</p>
                        <p className={styles.skinDescription}>Type: {skin.type}</p>

                        <div className={styles.priceBox}>
                            <span className={styles.vbucksIcon}>V</span>
                            <span className={styles.priceAmount}>
                                {skin.price.toLocaleString('pt-BR')}
                            </span>
                        </div>

                        {/* Lógica de Botão: Comprar ou Reembolsar */}
                        {skin.isPurchased ? (
                            // Se já comprou: Reembolsar
                            <button
                                className={`${styles.actionButton} ${styles.refundButton}`}
                                onClick={handleRefund} // Adicionado onClick
                            >
                                REEMBOLSAR
                            </button>
                        ) : (
                            // Se não comprou: Comprar
                            <button
                                className={`${styles.actionButton} ${styles.buyButton}`}
                                onClick={handlePurchase} // CORRIGIDO: Adicionado onClick
                                disabled={!canAfford} // Usa a variável canAfford
                            >
                                {canAfford ? 'COMPRAR' : 'V-BUCKS INSUFICIENTES'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
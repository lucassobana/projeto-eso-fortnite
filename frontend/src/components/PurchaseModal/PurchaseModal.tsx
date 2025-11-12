import styles from './PurchaseModal.module.css';
import logo from '../../assets/logo.png';
import vbucksIcon from '../../assets/vbucks.svg';

export interface Skin {
    id: string;
    name: string;
    description: string;
    type: string;
    rarity: string;
    price: number;
    image: string | null;
    isPurchased: boolean;
}

interface PurchaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    skin: Skin | null;
    userVBucks: number;
    onPurchase: (skin: Skin) => void;
    onRefund: (skin: Skin) => void;
}

export function PurchaseModal({
    isOpen,
    onClose,
    skin,
    userVBucks,
    onPurchase,
    onRefund,
}: PurchaseModalProps) {
    if (!isOpen || !skin) {
        return null;
    }

    const canAfford = userVBucks >= skin.price;

    const handlePurchase = () => {
        if (canAfford) {
            onPurchase(skin);
        }
    };

    const handleRefund = () => {
        onRefund(skin);
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>
                    &times;
                </button>

                <div className={styles.modalLayout}>
                    <div className={styles.leftPanel}>
                        {skin.image ? (
                            <img src={skin.image} alt={skin.name} className={styles.skinImage} />
                        ) : (
                            <img src={logo} alt="Fallback" className={styles.skinImage} />
                        )}
                    </div>

                    <div className={styles.rightPanel}>
                        <span className={styles.rarityTag}>{skin.rarity.toUpperCase()}</span>
                        <h1 className={styles.skinName}>{skin.name}</h1>
                        <p className={styles.skinDescription}>Description: {skin.description}</p>
                        <p className={styles.skinDescription}>Type: {skin.type}</p>

                        <div className={styles.priceBox}>
                            <img src={vbucksIcon} className={styles.vbucksIcon} />
                            <span className={styles.priceAmount}>
                                {skin.price.toLocaleString('pt-BR')}
                            </span>
                        </div>

                        {skin.isPurchased ? (
                            <button
                                className={`${styles.actionButton} ${styles.refundButton}`}
                                onClick={handleRefund}
                            >
                                REEMBOLSAR
                            </button>
                        ) : (
                            <button
                                className={`${styles.actionButton} ${styles.buyButton}`}
                                onClick={handlePurchase}
                                disabled={!canAfford}
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
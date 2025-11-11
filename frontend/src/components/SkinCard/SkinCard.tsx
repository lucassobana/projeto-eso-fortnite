import styles from "./SkinCard.module.css";
import logo from "../../assets/logo.png";

interface SkinCardProps {
  name: string;
  rarity: string;
  price: number;
  imageUrl: string | null;
  isNew: boolean;
  isOnSale: boolean;
  owned?: boolean;
  onClick?: () => void;
}

export function SkinCard({
  name,
  rarity,
  price,
  imageUrl,
  isNew,
  isOnSale,
  owned = false,
  onClick,
}: SkinCardProps) {
  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.imageContainer}>
        {imageUrl ? (
          <img src={imageUrl} alt={name} className={styles.image} />
        ) : (
          <img src={logo} alt="Fallback" className={styles.image} />
        )}
        {isNew && <span className={styles.badgeNew}>NEW</span>}
        {isOnSale && <span className={styles.badgeSale}>SALE</span>}
      </div>

      <div className={styles.info}>
        <span className={styles.rarity}>{rarity.toUpperCase()}</span>
        <h3 className={styles.name}>{name}</h3>

        <div className={styles.footer}>
          <span className={styles.price}>{price > 0 ? `${price}` : "Free"}</span>
          {owned && <span className={styles.owned}>OWNED</span>}
        </div>
      </div>
    </div>
  );
}
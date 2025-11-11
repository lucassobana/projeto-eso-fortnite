import styles from "./SkinCard.module.css";

interface SkinCardProps {
  name: string;
  rarity: string;
  price: number;
  imageUrl: string | null;
  isNew: boolean;
  isOnSale: boolean;
  owned?: boolean;
}

export function SkinCard({
  name,
  rarity,
  price,
  imageUrl,
  isNew,
  isOnSale,
  owned = false,
}: SkinCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        {imageUrl ? (
          <img src={imageUrl} alt={name} className={styles.image} />
        ) : (
          <div className={styles.noImage}>Sem imagem</div>
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

import { useEffect, useState } from "react";
import { SkinCard } from "../../components/SkinCard/SkinCard";
import styles from "./SkinList.module.css";
import type { FilterValues } from "../../components/FilterPanel/FilterPanel";

interface Cosmetic {
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

interface SkinListProps {
  filters: FilterValues;
}

export function SkinList({ filters }: SkinListProps) {
  const [cosmetics, setCosmetics] = useState<Cosmetic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCosmetics() {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:4000/api/cosmetics");
        const data: Cosmetic[] = await res.json();

        let filtered = data;

        if (filters.name) {
          filtered = filtered.filter((item) =>
            item.name.toLowerCase().includes(filters.name.toLowerCase())
          );
        }

        if (filters.type) {
          filtered = filtered.filter((item) => item.type === filters.type);
        }

        if (filters.rarity) {
          filtered = filtered.filter((item) => item.rarity === filters.rarity);
        }

        if (filters.startDate && filters.endDate) {
          const start = new Date(filters.startDate);
          const end = new Date(filters.endDate);
          filtered = filtered.filter((item) => {
            const date = new Date(item.added);
            return date >= start && date <= end;
          });
        }

        if (filters.onlyNew) filtered = filtered.filter((i) => i.isNew);
        if (filters.onlyOnSale) filtered = filtered.filter((i) => i.isOnSale);
        if (filters.onlyForSale)
          filtered = filtered.filter((i) => i.price > 0);

        setCosmetics(filtered);
      } catch (error) {
        console.error("Erro ao carregar itens:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCosmetics();
  }, [filters]);

  if (loading) return <p className={styles.loading}>Carregando...</p>;

  return (
    <div className={styles.grid}>
      {cosmetics.map((item) => (
        <SkinCard
          key={item.id}
          name={item.name}
          rarity={item.rarity}
          price={item.price}
          imageUrl={item.imageUrl}
          isNew={item.isNew}
          isOnSale={item.isOnSale}
          owned={false}
        />
      ))}
      {cosmetics.length === 0 && (
        <p className={styles.empty}>Nenhum item encontrado.</p>
      )}
    </div>
  );
}

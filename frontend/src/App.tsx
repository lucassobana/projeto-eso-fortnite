import "./App.css";
import { Header } from "./components/Header/Header";
import { FilterPanel } from "./components/FilterPanel/FilterPanel";
import type { FilterValues } from "./components/FilterPanel/FilterPanel";
import { SkinCard } from "./components/SkinCard/SkinCard";
import { Pagination } from "./components/Pagination/Pagination";
import { useEffect, useState } from "react";

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
  addedAt: string;
}

export function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 12; // 6 colunas × 3 linhas

  useEffect(() => {
    async function fetchItems() {
      try {
        const res = await fetch("http://localhost:4000/api/cosmetics");
        const data = await res.json();
        setItems(data);
        setFilteredItems(data);
      } catch (error) {
        console.error("Erro ao buscar itens:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, []);

  // Aplicar filtros
  function handleApplyFilters(filters: FilterValues) {
    const filtered = items.filter((item) => {
      const addedDate = new Date(item.addedAt);
      const startDate = filters.startDate ? new Date(filters.startDate) : null;
      const endDate = filters.endDate ? new Date(filters.endDate) : null;

      const matchName = item.name
        .toLowerCase()
        .includes(filters.name.toLowerCase());
      const matchType = filters.type ? item.type === filters.type : true;
      const matchRarity = filters.rarity ? item.rarity === filters.rarity : true;
      const matchDate =
        (!startDate || addedDate >= startDate) &&
        (!endDate || addedDate <= endDate);
      const matchOnlyNew = !filters.onlyNew || item.isNew;
      const matchOnlyOnSale = !filters.onlyOnSale || item.isOnSale;
      const matchOnlyForSale = !filters.onlyForSale || item.price > 0;
      const matchMyItems = !filters.myItems; // ajustar se backend tiver campo de "meus itens"

      return (
        matchName &&
        matchType &&
        matchRarity &&
        matchDate &&
        matchOnlyNew &&
        matchOnlyOnSale &&
        matchOnlyForSale &&
        matchMyItems
      );
    });

    setFilteredItems(filtered);
    setCurrentPage(1);
  }

  // Paginação
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const visibleItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <>
      <Header />

      <main className="app-layout">
        <aside className="sidebar">
          <FilterPanel onApplyFilters={handleApplyFilters} />
        </aside>

        <section className="content">
          {loading ? (
            <p className="loading">Carregando itens...</p>
          ) : filteredItems.length === 0 ? (
            <p className="no-results">Nenhum item encontrado com os filtros aplicados.</p>
          ) : (
            <>
              <div className="skins-grid">
                {visibleItems.map((item) => (
                  <SkinCard
                    key={item.id}
                    name={item.name}
                    rarity={item.rarity}
                    price={item.price}
                    imageUrl={item.imageUrl}
                    isNew={item.isNew}
                    isOnSale={item.isOnSale}
                  />
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </>
          )}
        </section>
      </main>
    </>
  );
}

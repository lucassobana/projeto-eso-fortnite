import "./App.css";
import { Header } from "./components/Header/Header";
import { FilterPanel } from "./components/FilterPanel/FilterPanel";
import type { FilterValues } from "./components/FilterPanel/FilterPanel";
import { SkinCard } from "./components/SkinCard/SkinCard";
import { Pagination } from "./components/Pagination/Pagination";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PurchaseModal,
} from "./components/PurchaseModal/PurchaseModal";
import type {
  Skin,
} from "./components/PurchaseModal/PurchaseModal";

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

interface UserData {
  id: string;
  email: string;
  vbucks: number;
}

export function App() {
  const navigate = useNavigate();

  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [userData, setUserData] = useState<UserData | null>(null);
  const [ownedSkinIds, setOwnedSkinIds] = useState<string[]>([]);
  const [selectedSkin, setSelectedSkin] = useState<Skin | null>(null);

  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }

    async function fetchItems() {
      try {
        const res = await fetch("http://localhost:4000/api/cosmetics");
        const data = await res.json();
        setItems(data);
        setFilteredItems(data);
        if (data.length > 1) {
          setOwnedSkinIds([data[1].id]); // Simulação
        }
      } catch (error) {
        console.error("Erro ao buscar itens:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, []);

  useEffect(() => {
    async function fetchInventory() {
      if (userData) {
        try {
          const res = await fetch(`http://localhost:4000/api/user/inventory/${userData.id}`);
          if (!res.ok) {
            throw new Error('Erro ao buscar inventário do usuário');
          }
          const inventoryItems: Item[] = await res.json();
          const ids = inventoryItems.map(item => item.id);
          setOwnedSkinIds(ids);

        } catch (error) {
          console.error("Erro ao buscar inventário:", error);
          setOwnedSkinIds([]);
        }
      } else {
        setOwnedSkinIds([]);
      }
    }

    fetchInventory();
  }, [userData]);

  const handleOpenModal = (item: Item, isOwned: boolean) => {
    const skinForModal: Skin = {
      id: item.id,
      name: item.name,
      description: item.description,
      type: item.type,
      rarity: item.rarity,
      price: item.price,
      image: item.imageUrl,
      isPurchased: isOwned,
    };
    setSelectedSkin(skinForModal);
  };

  const handleCloseModal = () => {
    setSelectedSkin(null);
  };

  const handlePurchase = async (skinToBuy: Skin) => {
    // 1. Verifica se o usuário está logado
    if (!userData) {
      alert("Você precisa estar logado para realizar uma compra.");
      navigate("/login"); // Redireciona para o login
      return;
    }

    // 2. Tenta realizar a chamada de API
    try {
      const response = await fetch("http://localhost:4000/api/user/buy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userData.id,
          cosmeticId: skinToBuy.id,
        }),
      });

      const data = await response.json();

      // 3. Trata a resposta
      if (!response.ok) {
        // Exibe o erro específico vindo do backend (ex: "V-Bucks insuficientes.")
        throw new Error(data.error || "Erro ao processar a compra.");
      }

      // 4. Sucesso! Atualiza o estado do frontend

      // Atualiza os dados do usuário (principalmente V-Bucks)
      const updatedUserData = data.user;
      setUserData(updatedUserData);
      localStorage.setItem("user", JSON.stringify(updatedUserData));

      // Adiciona o item à lista de itens possuídos
      setOwnedSkinIds((ids) => [...ids, skinToBuy.id]);

      // Fecha o modal
      handleCloseModal();

    } catch (error) {
      console.error("Erro na compra:", error);
    }
  };

  const handleRefund = async (skinToRefund: Skin) => {
    if (!userData) {
      alert("Você precisa estar logado para realizar uma compra.");
      navigate("/login"); 
      return;
    }
    
    try {
      const response = await fetch("http://localhost:4000/api/user/refund", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userData.id,
          cosmeticId: skinToRefund.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Exibe o erro do backend (ex: "Você não possui este item...")
        throw new Error(data.error || "Erro ao processar o reembolso.");
      }

      // Sucesso! Atualiza o estado do frontend
      const updatedUserData = data.user;
      setUserData(updatedUserData);
      localStorage.setItem("user", JSON.stringify(updatedUserData));

      // Remove o item da lista local de itens possuídos
      setOwnedSkinIds((ids) => ids.filter((id) => id !== skinToRefund.id));

      handleCloseModal();

    } catch (error) {
      console.error("Erro no reembolso:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUserData(null);
    navigate("/login");
  };

  function handleApplyFilters(filters: FilterValues) {
    const filtered = items.filter((item) => {
      const addedDate = new Date(item.added);
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

      return (
        matchName &&
        matchType &&
        matchRarity &&
        matchDate &&
        matchOnlyNew &&
        matchOnlyOnSale &&
        matchOnlyForSale
      );
    });

    setFilteredItems(filtered);
    setCurrentPage(1);
  }

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const visibleItems = filteredItems.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <>
      <Header userData={userData} onLogout={handleLogout} />

      <main className="app-layout">
        <aside className="sidebar">
          <FilterPanel onApplyFilters={handleApplyFilters} />
        </aside>

        <section className="content">
          {loading ? (
            <p className="loading">Carregando itens...</p>
          ) : filteredItems.length === 0 ? (
            <p className="no-results">
              Nenhum item encontrado com os filtros aplicados.
            </p>
          ) : (
            <>
              <div className="skins-grid">
                {visibleItems.map((item) => {
                  const isOwned = ownedSkinIds.includes(item.id);
                  return (
                    <SkinCard
                      key={item.id}
                      name={item.name}
                      rarity={item.rarity}
                      price={item.price}
                      imageUrl={item.imageUrl}
                      isNew={item.isNew}
                      isOnSale={item.isOnSale}
                      owned={isOwned}
                      onClick={() => handleOpenModal(item, isOwned)}
                    />
                  );
                })}
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

      <PurchaseModal
        isOpen={!!selectedSkin}
        onClose={handleCloseModal}
        skin={selectedSkin}
        userVBucks={userData ? userData.vbucks : 0}
        onPurchase={handlePurchase}
        onRefund={handleRefund}
      />
    </>
  );
}
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Header } from "../../components/Header/Header";
import { SkinCard } from "../../components/SkinCard/SkinCard";
import { PurchaseModal } from "../../components/PurchaseModal/PurchaseModal";
import type { Skin } from "../../components/PurchaseModal/PurchaseModal";
import styles from "./MyItens.module.css"

interface UserData {
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

export function MyItems() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [inventory, setInventory] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedSkin, setSelectedSkin] = useState<Skin | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    
    if (!storedUser) {
      navigate("/login");
      return;
    }

    const user: UserData = JSON.parse(storedUser);
    setUserData(user);

    async function fetchInventory(userId: string) {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`http://projeto-eso-fortnite-production.up.railway.app/api/user/inventory/${userId}`);
        
        if (!res.ok) {
          throw new Error("Falha ao carregar o inventário.");
        }
        
        const data: Item[] = await res.json();
        setInventory(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Ocorreu um erro desconhecido ao buscar o inventário.");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchInventory(user.id);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUserData(null);
    navigate("/login");
  };

  const handleOpenModal = (item: Item) => {
    const skinForModal: Skin = {
      ...item,
      image: item.imageUrl,
      isPurchased: true, 
    };
    setSelectedSkin(skinForModal);
  };

  const handleCloseModal = () => {
    setSelectedSkin(null);
  };

  const handleRefund = async (skinToRefund: Skin) => {
    if (!userData) {
      alert("Você precisa estar logado para reembolsar.");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch("http://projeto-eso-fortnite-production.up.railway.app/api/user/refund", {
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
        throw new Error(data.error || "Erro ao processar o reembolso.");
      }

      const updatedUserData = data.user;
      setUserData(updatedUserData);
      localStorage.setItem("user", JSON.stringify(updatedUserData));

      setInventory((prevInventory) =>
        prevInventory.filter((item) => item.id !== skinToRefund.id)
      );
      
      handleCloseModal(); 

    } catch (err) {
      console.error("Erro no reembolso:", err);
      if (err instanceof Error) {
        alert(`Erro ao reembolsar: ${err.message}`);
      } else {
        alert("Ocorreu um erro desconhecido.");
      }
    }
  };

  const renderContent = () => {
    if (loading) {
      return <p className={styles.message}>Carregando seus itens...</p>;
    }
    if (error) {
      return <p className={styles.message}>{error}</p>;
    }
    if (inventory.length === 0) {
      return (
        <p className={styles.message}>
          Você ainda não possui nenhum item.
        </p>
      );
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
            onClick={() => handleOpenModal(item)}
          />
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
        <h1 className={styles.title}>Meus Itens</h1>
        
        {renderContent()}
      </main>

      <PurchaseModal
        isOpen={!!selectedSkin}
        onClose={handleCloseModal}
        skin={selectedSkin}
        userVBucks={userData ? userData.vbucks : 0}
        onPurchase={() => {}}
        onRefund={handleRefund}
      />
    </>
  );
}
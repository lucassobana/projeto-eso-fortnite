import React, { useEffect, useState } from "react";
import styles from "./FilterPanel.module.css";

interface FilterOption {
  id: string;
  name: string;
}

interface FiltersData {
  types: FilterOption[];
  rarities: FilterOption[];
}

export interface FilterValues {
  name: string;
  type: string;
  rarity: string;
  startDate: string;
  endDate: string;
  onlyNew: boolean;
  onlyForSale: boolean;
  onlyOnSale: boolean;
  myItems: boolean;
}

interface FilterPanelProps {
  onApplyFilters: (filters: FilterValues) => void;
}

interface BackendItem {
  id: string;
  name: string;
  type: string;
  rarity: string;
  added: string;
}

export function FilterPanel({ onApplyFilters }: FilterPanelProps) {
  const [filtersData, setFiltersData] = useState<FiltersData>({
    types: [],
    rarities: [],
  });

  const [filters, setFilters] = useState<FilterValues>({
    name: "",
    type: "",
    rarity: "",
    startDate: "",
    endDate: "",
    onlyNew: false,
    onlyForSale: false,
    onlyOnSale: false,
    myItems: false,
  });

  // 🔹 Busca dados do backend e extrai filtros dinamicamente
  useEffect(() => {
    async function fetchFilters() {
      try {
        const res = await fetch("http://localhost:4000/api/cosmetics");
        const data: BackendItem[] = await res.json();

        if (!Array.isArray(data)) {
          console.error("A resposta do backend não é uma lista:", data);
          return;
        }

        // Extrai tipos e raridades únicos
        const uniqueTypes: FilterOption[] = Array.from(
          new Set(data.map((item) => item.type).filter(Boolean))
        ).map((t) => ({ id: t, name: t }));

        const uniqueRarities: FilterOption[] = Array.from(
          new Set(data.map((item) => item.rarity).filter(Boolean))
        ).map((r) => ({ id: r, name: r }));

        // Define o intervalo de datas automaticamente
        const dates = data
          .map((item) => new Date(item.added).getTime())
          .filter((d) => !isNaN(d));

        if (dates.length > 0) {
          const minDate = new Date(Math.min(...dates));
          const maxDate = new Date(Math.max(...dates));

          setFilters((prev) => ({
            ...prev,
            startDate: minDate.toISOString().split("T")[0],
            endDate: maxDate.toISOString().split("T")[0],
          }));
        }

        setFiltersData({
          types: uniqueTypes,
          rarities: uniqueRarities,
        });
      } catch (error) {
        console.error("Erro ao carregar filtros:", error);
      }
    }

    fetchFilters();
  }, []);

  // 🔹 Atualiza filtros
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target;
    const newValue =
      type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : value;

    setFilters((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  }

  // 🔹 Envia filtros ao pai
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onApplyFilters(filters);
  }

  return (
    <form className={styles.filterPanel} onSubmit={handleSubmit}>
      <h2 className={styles.filterTitle}>Filtros</h2>

      {/* Nome */}
      <div className={styles.filterGroup}>
        <label htmlFor="name">Nome</label>
        <input
          id="name"
          type="text"
          name="name"
          placeholder="Skin name"
          value={filters.name}
          onChange={handleChange}
        />
      </div>

      {/* Tipo */}
      <div className={styles.filterGroup}>
        <label htmlFor="type">Tipo</label>
        <select
          id="type"
          name="type"
          value={filters.type}
          onChange={handleChange}
        >
          <option value="">Todos</option>
          {filtersData.types.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      {/* Raridade */}
      <div className={styles.filterGroup}>
        <label htmlFor="rarity">Raridade</label>
        <select
          id="rarity"
          name="rarity"
          value={filters.rarity}
          onChange={handleChange}
        >
          <option value="">Todas</option>
          {filtersData.rarities.map((rarity) => (
            <option key={rarity.id} value={rarity.id}>
              {rarity.name}
            </option>
          ))}
        </select>
      </div>

      {/* Datas */}
      <div className={styles.filterGroup}>
        <label>Data de inclusão:</label>
        <div className={styles.dateRange}>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleChange}
          />
          <span>-</span>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Opções */}
      <div className={styles.filterGroup}>
        <label>Opções</label>
        <div className={styles.checkboxGroup}>
          <label>
            <input
              type="checkbox"
              name="onlyNew"
              checked={filters.onlyNew}
              onChange={handleChange}
            />
            Apenas novos
          </label>

          <label>
            <input
              type="checkbox"
              name="onlyForSale"
              checked={filters.onlyForSale}
              onChange={handleChange}
            />
            Apenas à venda
          </label>

          <label>
            <input
              type="checkbox"
              name="onlyOnSale"
              checked={filters.onlyOnSale}
              onChange={handleChange}
            />
            Apenas em promoção
          </label>

          <label>
            <input
              type="checkbox"
              name="myItems"
              checked={filters.myItems}
              onChange={handleChange}
            />
            Meus itens
          </label>
        </div>
      </div>

      <button type="submit" className={styles.applyButton}>
        Aplicar Filtros
      </button>
    </form>
  );
}

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
  });

  useEffect(() => {
    async function fetchFilters() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/cosmetics`);
        const data: BackendItem[] = await res.json();

        if (!Array.isArray(data)) {
          console.error("A resposta do backend não é uma lista:", data);
          return;
        }

        const uniqueTypes: FilterOption[] = Array.from(
          new Set(data.map((item) => item.type).filter(Boolean))
        ).map((t) => ({ id: t, name: t }));

        const uniqueRarities: FilterOption[] = Array.from(
          new Set(data.map((item) => item.rarity).filter(Boolean))
        ).map((r) => ({ id: r, name: r }));

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

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onApplyFilters(filters);
  }

  return (
    <form className={styles.filterPanel} onSubmit={handleSubmit}>
      <h2 className={styles.filterTitle}>Filtros</h2>

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

      <div className={styles.filterGroup}>
        <label>Opções</label>
        <div className={styles.checkboxGroup}>

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="onlyNew"
              checked={filters.onlyNew}
              onChange={handleChange}
            />
            <span className={styles.customCheckbox}></span>
            <span className={styles.checkboxText}>Apenas novos</span>
          </label>

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="onlyForSale"
              checked={filters.onlyForSale}
              onChange={handleChange}
            />
            <span className={styles.customCheckbox}></span>
            <span className={styles.checkboxText}>Apenas à venda</span>
          </label>

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="onlyOnSale"
              checked={filters.onlyOnSale}
              onChange={handleChange}
            />
            <span className={styles.customCheckbox}></span>
            <span className={styles.checkboxText}>Apenas em promoção</span>
          </label>

        </div>
      </div>

      <button type="submit" className={styles.applyButton}>
        Aplicar Filtros
      </button>
    </form>
  );
}

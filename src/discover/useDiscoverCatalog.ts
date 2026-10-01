import { useCallback, useEffect, useState } from 'react';

import {
  findCatalogPokemonBySlug,
  pokemonCatalog,
  pokemonCatalogCount,
  type PokemonCatalogItem,
} from '../_shared/catalog';
import { fetchPokemonSpeciesIndex } from '../_shared/pokeapi';

type DiscoverCatalogState = {
  items: PokemonCatalogItem[];
  apiTotalCount: number;
  isLoading: boolean;
  refreshing: boolean;
  error: string | null;
};

const initialState: DiscoverCatalogState = {
  items: pokemonCatalog,
  apiTotalCount: pokemonCatalogCount,
  isLoading: false,
  refreshing: false,
  error: null,
};

export function useDiscoverCatalog() {
  const [state, setState] = useState<DiscoverCatalogState>(initialState);

  const loadCatalog = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    setState((current) => ({
      ...current,
      error: null,
      isLoading: false,
      refreshing: mode === 'refresh',
    }));

    try {
      const data = await fetchPokemonSpeciesIndex();
      const items = data.slugs
        .map((slug) => findCatalogPokemonBySlug(slug))
        .filter((item): item is PokemonCatalogItem => Boolean(item))
        .sort((left, right) => left.id - right.id);

      setState({
        items,
        apiTotalCount: data.count,
        isLoading: false,
        refreshing: false,
        error: null,
      });
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? 'Impossible de synchroniser la liste PokéAPI pour le moment.'
          : "Impossible de charger la liste depuis l'API.";

      setState((current) => ({
        ...current,
        items: current.items.length > 0 ? current.items : pokemonCatalog,
        apiTotalCount: current.apiTotalCount || pokemonCatalogCount,
        isLoading: false,
        refreshing: false,
        error: message,
      }));
    }
  }, []);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  return {
    ...state,
    refresh: () => loadCatalog('refresh'),
    retry: () => loadCatalog('initial'),
  };
}

import { useCallback, useEffect, useState } from 'react';

import { fetchPokemonAtlas, type PokemonAtlasData } from '../_shared/pokeapi';

type PokemonAtlasState = {
  data: PokemonAtlasData | null;
  isLoading: boolean;
  error: string | null;
};

export function usePokemonAtlas(slug: string) {
  const [reloadToken, setReloadToken] = useState(0);
  const [state, setState] = useState<PokemonAtlasState>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    setState((current) => ({
      data: current.data?.slug === slug ? current.data : null,
      isLoading: true,
      error: null,
    }));

    fetchPokemonAtlas(slug)
      .then((data) => {
        if (cancelled) {
          return;
        }

        setState({
          data,
          isLoading: false,
          error: null,
        });
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        setState({
          data: null,
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : "Impossible de charger l'atlas des rencontres.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [reloadToken, slug]);

  const reload = useCallback(() => {
    setReloadToken((current) => current + 1);
  }, []);

  return {
    ...state,
    reload,
  };
}

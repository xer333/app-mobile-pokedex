import { useCallback, useEffect, useState } from 'react';

import { fetchPokemonDetail, type PokemonDetailData } from '../_shared/pokeapi';

type PokemonDetailState = {
  data: PokemonDetailData | null;
  isLoading: boolean;
  error: string | null;
};

export function usePokemonDetail(slug: string) {
  const [reloadToken, setReloadToken] = useState(0);
  const [state, setState] = useState<PokemonDetailState>({
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

    fetchPokemonDetail(slug)
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
              : 'Impossible de charger les donn\u00e9es du Pok\u00e9mon.',
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

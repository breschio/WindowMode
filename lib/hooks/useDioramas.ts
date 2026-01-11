'use client';

import useSWR from 'swr';
import { Diorama } from '@/types';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function useDioramas() {
  const { data, error, mutate, isLoading } = useSWR<{ dioramas: Diorama[] }>(
    '/api/dioramas',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  );

  return {
    dioramas: data?.dioramas || [],
    isLoading,
    isError: error,
    mutate
  };
}

export function useDiorama(id: string | null) {
  const { data, error, mutate, isLoading } = useSWR<{ diorama: Diorama }>(
    id ? `/api/dioramas/${id}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  );

  return {
    diorama: data?.diorama,
    isLoading,
    isError: error,
    mutate
  };
}

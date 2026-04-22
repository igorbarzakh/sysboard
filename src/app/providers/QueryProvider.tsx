'use client'

import { useEffect } from 'react'
import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

declare global {
  interface Window {
    __TANSTACK_QUERY_CLIENT__?: QueryClient
  }
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 60_000,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined
const isDevelopment = process.env.NODE_ENV === 'development'

function getQueryClient() {
  if (isServer) {
    return makeQueryClient()
  }

  browserQueryClient ??= makeQueryClient()
  return browserQueryClient
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  useEffect(() => {
    if (!isDevelopment) return
    window.__TANSTACK_QUERY_CLIENT__ = queryClient
  }, [queryClient])

  return (
    <QueryClientProvider client={queryClient}>
      {children}

      {isDevelopment && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}

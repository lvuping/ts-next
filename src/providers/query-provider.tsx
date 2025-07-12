'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ReactNode, useState } from 'react'

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 기본 캐시 시간: 30분 (새로고침 시에도 캐시 유지)
            staleTime: 30 * 60 * 1000,
            // 가비지 컬렉션 시간: 1시간
            gcTime: 60 * 60 * 1000,
            // 재시도 횟수
            retry: 1,
            // 리포커스 시 재검증 비활성화
            refetchOnWindowFocus: false,
            // 재연결 시 재검증 비활성화
            refetchOnReconnect: false,
            // 마운트 시 항상 재검증하되, 캐시가 있으면 먼저 보여줌
            refetchOnMount: true,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
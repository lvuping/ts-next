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
            // 기본 캐시 시간: 5분
            staleTime: 5 * 60 * 1000,
            // 가비지 컬렉션 시간: 10분
            gcTime: 10 * 60 * 1000,
            // 재시도 횟수
            retry: 1,
            // 리포커스 시 재검증 비활성화 (필요시 개별 쿼리에서 활성화)
            refetchOnWindowFocus: false,
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
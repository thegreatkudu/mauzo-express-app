import React, { useRef } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner-native'

export default function Providers({ children }: { children: React.ReactNode }) {
    const queryClient = useRef(
        new QueryClient({
            defaultOptions: {
                queries: { refetchOnWindowFocus: false, retry: 1 },
            },
        })
    ).current

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <Toaster position='bottom-center' />
        </QueryClientProvider>
    )
}

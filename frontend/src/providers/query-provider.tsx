import queryClient from '@/lib/query-client'
import { QueryClientProvider } from '@tanstack/react-query'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export const ReactQueryProvider = ({ children } : { children : React.ReactNode }) => {
    return (
        <QueryClientProvider client={queryClient}>
            {/* <ReactQueryDevtools initialIsOpen={false} /> */}
            {children}
        </QueryClientProvider>
    )
}
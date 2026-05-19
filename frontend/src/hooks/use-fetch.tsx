import { http } from "@/service";
import { useQuery, type UseQueryResult } from "@tanstack/react-query"
import { AxiosError } from "axios"

const fetchQuery = async (url: string) => {
    try {
        const response = await http(url);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            throw new Error(error.response?.data?.message || error.message)
        }
    }
}

export function useFetch<T>(endpoint: string): UseQueryResult<T | any> {
    const usequery = useQuery<T | any>({ queryKey: [`${endpoint}`], queryFn: () => fetchQuery(endpoint) })
    return usequery
}
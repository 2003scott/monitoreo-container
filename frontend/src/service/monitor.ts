import { http } from "."

export const monitorService = async () => {
    try {
        const response = await http('/monitor')
        console.log('Monitor data fetched successfully:', response.data)
        return response.data
    } catch (error) {
        console.error('Error fetching monitor data:', error)
        if (error instanceof Error) {
            throw new Error(`Failed to fetch monitor data: ${error.message}`)
        } else {
            throw new Error('An unknown error occurred while fetching monitor data')
        }
    }
}
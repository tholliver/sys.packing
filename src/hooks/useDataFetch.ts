import useSWR, { type SWRConfiguration } from 'swr'
import { toast } from 'sonner'
import { useMemo, useCallback, useState } from 'react'

// Types
type EndpointFunction = (id: string | number) => string;
type Endpoint = string | EndpointFunction;

interface Pagination {
    totalPages: number
    currentPage: number
    total: number
}

interface PaginatedResponse<T> {
    data: T[]
    pagination: Pagination
}

interface UseDataFetchParams {
    endpoint: string
    enabled?: boolean
    defaultFilters?: Record<string, string | number>
}

interface UseDataFetchReturn<T> {
    data: T[]
    pagination: Pagination | undefined
    isLoading: boolean
    error: string | null
    refetch: () => Promise<PaginatedResponse<T> | undefined>
    isEmpty: boolean
    filters: Record<string, string>
    updateFilter: (key: string, value: string | null) => void
    clearFilters: () => void
}

interface UseMutationParams {
    endpoint: Endpoint
    method?: 'POST' | 'PUT' | 'DELETE'
    onSuccess?: (data: any) => void
    onError?: (error: Error) => void
}

interface UseMutationReturn {
    mutate: (data?: any, id?: string, customEndpoint?: string) => Promise<any>
    loading: boolean
    error: string | null
}

// Optimized SWR config for minimal requests
const swrConfig: SWRConfiguration = {
    /* dedupingInterval: 600000, // 10 minutes
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    refreshInterval: 0,
    errorRetryCount: 1,
    errorRetryInterval: 2000, */
}

// Generic fetcher
const fetcher = async <T>(url: string): Promise<PaginatedResponse<T>> => {
    const response = await fetch(url)

    if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    return response.json()
}

// URL parameter management without useEffect
class URLParamManager {
    private static instance: URLParamManager
    private listeners: Set<(params: URLSearchParams) => void> = new Set()
    private currentParams: URLSearchParams = new URLSearchParams(window.location.search)

    static getInstance(): URLParamManager {
        if (!URLParamManager.instance) {
            URLParamManager.instance = new URLParamManager()
            URLParamManager.instance.init()
        }
        return URLParamManager.instance
    }

    private init() {
        // Listen for popstate events (browser back/forward)
        window.addEventListener('popstate', this.handlePopState)
    }

    private handlePopState = () => {
        this.currentParams = new URLSearchParams(window.location.search)
        this.notifyListeners()
    }

    subscribe(callback: (params: URLSearchParams) => void): () => void {
        this.listeners.add(callback)
        // Return unsubscribe function
        return () => {
            this.listeners.delete(callback)
        }
    }

    updateParams(newParams: URLSearchParams) {
        this.currentParams = newParams
        this.notifyListeners()
    }

    getCurrentParams(): URLSearchParams {
        return new URLSearchParams(this.currentParams)
    }

    private notifyListeners() {
        this.listeners.forEach(callback => callback(new URLSearchParams(this.currentParams)))
    }

    destroy() {
        window.removeEventListener('popstate', this.handlePopState)
        this.listeners.clear()
    }
}

// Custom hook to manage URL parameters without useEffect
const useURLParams = () => {
    const manager = URLParamManager.getInstance()
    const [urlParams, setUrlParams] = useState<URLSearchParams>(() => manager.getCurrentParams())

    // Subscribe to changes on component mount, unsubscribe on unmount
    useMemo(() => {
        const unsubscribe = manager.subscribe(setUrlParams)

        // Return cleanup function that will be called when component unmounts
        // or when dependencies change
        return unsubscribe
    }, [manager])

    return urlParams
}

// Generic data fetching hook with URL param sync for Astro
export const useDataFetch = <T>({
    endpoint,
    enabled = true,
    defaultFilters = {},
}: UseDataFetchParams): UseDataFetchReturn<T> => {
    const urlParams = useURLParams()

    // Extract filters from URL params
    const filters = useMemo(() => {
        const params: Record<string, string> = {}

        // Get all search params
        urlParams.forEach((value, key) => {
            params[key] = value
        })

        // Apply defaults for missing params
        Object.entries(defaultFilters).forEach(([key, defaultValue]) => {
            if (!params[key]) {
                params[key] = defaultValue.toString()
            }
        })

        return params
    }, [urlParams, defaultFilters])

    // Build API URL with filters
    const apiUrl = useMemo(() => {
        if (!enabled) return null

        const params = new URLSearchParams(filters)
        return `${endpoint}?${params.toString()}`
    }, [endpoint, filters, enabled])

    // SWR hook
    const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<T>>(
        apiUrl,
        fetcher,
        {
            ...swrConfig,
            onError: (error: Error) => {
                toast.error("Error", {
                    description: error.message || "Error al obtener los datos",
                })
            },
        }
    )

    // Update URL params
    const updateFilter = useCallback((key: string, value: string | null) => {
        const manager = URLParamManager.getInstance()
        const currentParams = manager.getCurrentParams()
        const newParams = new URLSearchParams(currentParams)

        if (value === null || value === '') {
            newParams.delete(key)
        } else {
            newParams.set(key, value)
        }

        // Reset to page 1 when filtering (except for page param)
        if (key !== 'page') {
            newParams.set('page', '1')
        }

        const search = newParams.toString()
        const newUrl = `${window.location.pathname}${search ? `?${search}` : ''}`

        window.history.pushState({}, '', newUrl)
        manager.updateParams(newParams)
    }, [])

    // Clear all filters
    const clearFilters = useCallback(() => {
        const manager = URLParamManager.getInstance()
        const newUrl = window.location.pathname
        window.history.pushState({}, '', newUrl)
        manager.updateParams(new URLSearchParams())
    }, [])

    return {
        data: data?.data ?? [],
        pagination: data?.pagination,
        isLoading: isLoading,
        error: error?.message ?? null,
        refetch: mutate,
        isEmpty: !isLoading && (!data?.data || data.data.length === 0),
        filters,
        updateFilter,
        clearFilters,
    }
}

const resolveEndpointUrl = (
    endpoint: Endpoint,
    id?: string,
    customEndpoint?: string
): string => {
    // Priority: customEndpoint > function endpoint > static endpoint
    if (customEndpoint) {
        return customEndpoint;
    }

    if (typeof endpoint === 'function') {
        if (!id) {
            throw new Error('ID is required for function endpoints');
        }
        return endpoint(id);
    }

    // Static endpoint - append id if provided
    return id ? `${endpoint}/${id}` : endpoint;
};

// Generic mutation hook - now more flexible with optional endpoint
export const useMutation = ({
    endpoint,
    method = 'POST',
    onSuccess,
    onError,
}: UseMutationParams): UseMutationReturn => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const mutate = useCallback(async (data?: any, id?: string, customEndpoint?: string) => {
        setLoading(true)
        setError(null)

        try {
            // Use custom endpoint if provided, otherwise use the default one
            const baseEndpoint = customEndpoint || endpoint
            if (!baseEndpoint) {
                throw new Error('No endpoint provided')
            }

            const url = resolveEndpointUrl(endpoint, id, customEndpoint);
            const options: RequestInit = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
            }

            if (data && method !== 'DELETE') {
                options.body = JSON.stringify(data)
            }

            const response = await fetch(url, options)

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`)
            }

            const result = response.status === 204 ? null : await response.json()

            if (onSuccess) {
                onSuccess(result)
            }

            toast.success("Éxito", {
                description: "Operación completada correctamente",
            })

            return result

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
            setError(errorMessage)

            if (onError) {
                onError(err as Error)
            } else {
                toast.error("Error", {
                    description: errorMessage,
                })
            }

            throw err

        } finally {
            setLoading(false)
        }
    }, [endpoint, method, onSuccess, onError])

    return {
        mutate,
        loading,
        error,
    }
}

// Flexible mutation hooks - can be used without predefined endpoints
/* export const useGenericMutation = (method: 'POST' | 'PUT' | 'DELETE' = 'POST') => {
    return useMutation({ method })
} */

// Specialized hooks for common use cases
export const usePackages = (defaultFilters = {}) => {
    return useDataFetch({
        endpoint: '/api/packages',
        defaultFilters: {
            page: 1,
            limit: 10,
            type: 'all',
            status: 'all',
            ...defaultFilters,
        },
    })
}

export const useAdminPackages = (defaultFilters = {}) => {
    return useDataFetch({
        endpoint: '/api/admin/packages',
        defaultFilters: {
            page: 1,
            limit: 10,
            type: 'all',
            status: 'all',
            ...defaultFilters,
        },
    })
}

// Flexible package mutations - endpoints can be provided at runtime
/* export const usePackageMutations = () => {
    const create = useGenericMutation('POST')
    const update = useGenericMutation('PUT')
    const remove = useGenericMutation('DELETE')

    return { create, update, remove }
}

// Example usage functions to demonstrate flexibility
export const useFlexibleMutations = () => {
    const postMutation = useGenericMutation('POST')
    const putMutation = useGenericMutation('PUT')
    const deleteMutation = useGenericMutation('DELETE')

    // Helper functions that show how to use with different endpoints
    const createUser = (userData: any) =>
        postMutation.mutate(userData, undefined, '/api/users')

    const updateUser = (userId: string, userData: any) =>
        putMutation.mutate(userData, userId, '/api/users')

    const deleteUser = (userId: string) =>
        deleteMutation.mutate(undefined, userId, '/api/users')

    const createProduct = (productData: any) =>
        postMutation.mutate(productData, undefined, '/api/products')

    const updateProduct = (productId: string, productData: any) =>
        putMutation.mutate(productData, productId, '/api/products')

    const uploadFile = (fileData: any) =>
        postMutation.mutate(fileData, undefined, '/api/files/upload')

    return {
        // Raw mutation hooks
        postMutation,
        putMutation,
        deleteMutation,
        // Helper functions
        createUser,
        updateUser,
        deleteUser,
        createProduct,
        updateProduct,
        uploadFile,
    }
} */
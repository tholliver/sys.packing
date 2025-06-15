const API_BASE = '/api'

export const fetcher = (url: string) => fetch(url).then((res) => res.json())

export const Tfetcher = async <T>(url: string): Promise<T> => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error("Failed to fetch data");
    }
    return response.json();
};

export const apiEndpoints = {
    auth: {
        login: `${API_BASE}/auth/login`,
        logout: `${API_BASE}/auth/logout`,
        register: `${API_BASE}/auth/register`,
        refreshToken: `${API_BASE}/auth/refresh-token`,
    },
    user: {
        profile: `${API_BASE}/user/profile`,
        update: `${API_BASE}/user/update`,
        delete: `${API_BASE}/user/delete`,
    },
    packages: {
        list: `${API_BASE}/packages/list.json`,
        history: (id: string | number) =>
            `${API_BASE}/packages/${id}/history.json`,
        create: `${API_BASE}/packages/create.json`,
        update: (id: string | number) => `${API_BASE}/packages/${id}/status.json`,
        delete: `${API_BASE}/packages/delete.json`,
    },
}
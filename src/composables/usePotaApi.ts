const BASE = 'https://api.pota.app'

export interface PotaPark {
    reference: string
    name: string
    locationName: string
}

export function isPotaReference(text: string): boolean {
    return /^[A-Z]{1,4}-\d+$/i.test(text.trim())
}

export async function lookupParkByReference(reference: string): Promise<PotaPark | null> {
    try {
        const res = await fetch(`${BASE}/park/${encodeURIComponent(reference.toUpperCase())}`)
        if (!res.ok) return null
        const data = await res.json() as Record<string, unknown>
        if (!data.reference) return null
        return {
            reference: data.reference as string,
            name: data.name as string,
            locationName: (data.locationName as string) ?? '',
        }
    } catch {
        return null
    }
}

export async function searchParksByName(query: string): Promise<PotaPark[]> {
    try {
        const res = await fetch(`${BASE}/parks/search?q=${encodeURIComponent(query)}&count=8`)
        if (!res.ok) return []
        const data = await res.json()
        if (!Array.isArray(data)) return []
        return (data as Record<string, unknown>[]).map(p => ({
            reference: p.reference as string,
            name: p.name as string,
            locationName: (p.locationName as string) ?? '',
        }))
    } catch {
        return []
    }
}

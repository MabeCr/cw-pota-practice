import parksData from '@/resources/all_parks.json'

export interface ParkEntry {
    reference: string
    name: string
    states: string[]
}

const parks = (parksData as Array<{ reference: string; name: string; states: string | string[] }>).map(p => ({
    ...p,
    states: Array.isArray(p.states) ? p.states : [p.states],
}))

// Index parks by state code at module load time for O(1) lookup
const byState = new Map<string, ParkEntry[]>()
for (const park of parks) {
    for (const state of park.states) {
        const list = byState.get(state)
        if (list) list.push(park)
        else byState.set(state, [park])
    }
}

export function getRandomParkForState(stateCode: string): ParkEntry | null {
    const list = byState.get(stateCode.toUpperCase())
    if (!list || list.length === 0) return null
    return list[Math.floor(Math.random() * list.length)] ?? null
}

export function isPotaReference(text: string): boolean {
    return /^[A-Z]{1,4}-\d+$/i.test(text.trim())
}

export function lookupParkByRef(reference: string): ParkEntry | null {
    const upper = reference.trim().toUpperCase()
    return parks.find(p => p.reference.toUpperCase() === upper) ?? null
}

export function searchParks(query: string, limit = 10): ParkEntry[] {
    const lower = query.trim().toLowerCase()
    if (!lower) return []
    const results: ParkEntry[] = []
    for (const park of parks) {
        if (park.reference.toLowerCase().includes(lower) || park.name.toLowerCase().includes(lower)) {
            results.push(park)
            if (results.length >= limit) break
        }
    }
    return results
}

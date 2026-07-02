import parksData from '@/resources/all_parks.json'

interface ParkEntry {
    reference: string
    name: string
    states: string[]
}

const parks = parksData as ParkEntry[]

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

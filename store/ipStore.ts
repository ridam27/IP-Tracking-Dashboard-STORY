import { create } from 'zustand'
import { IPAsset } from '@/types'

interface IPState {
  assets: IPAsset[]
  hydrated: boolean
  addAsset: (asset: IPAsset) => void
  getAsset: (id: string) => IPAsset | undefined
  getAssetsByCreator: (creator: string) => IPAsset[]
  getDerivatives: (parentId: string) => IPAsset[]
  createRemix: (parentId: string, newAsset: Omit<IPAsset, 'id' | 'ipType' | 'parentId' | 'timestamp' | 'derivatives'>) => IPAsset
  hydrate: () => void
}

const generateId = () => `ip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

// Load from localStorage (client-side only)
const loadAssets = (): IPAsset[] => {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem('story-ip-storage')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

// Save to localStorage
const saveAssets = (assets: IPAsset[]) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('story-ip-storage', JSON.stringify(assets))
  } catch (error) {
    console.error('Failed to save assets:', error)
  }
}

export const useIPStore = create<IPState>((set, get) => ({
  assets: [],
  hydrated: false,
  hydrate: () => {
    if (get().hydrated) return
    const loadedAssets = loadAssets()
    set({ assets: loadedAssets, hydrated: true })
  },
  addAsset: (asset) => {
    const newAssets = [...get().assets, asset]
    set({ assets: newAssets })
    saveAssets(newAssets)
  },
  getAsset: (id) => {
    return get().assets.find((asset) => asset.id === id)
  },
  getAssetsByCreator: (creator) => {
    return get().assets.filter((asset) => asset.creator.toLowerCase() === creator.toLowerCase())
  },
  getDerivatives: (parentId) => {
    return get().assets.filter((asset) => asset.parentId === parentId)
  },
  createRemix: (parentId, newAssetData) => {
    const parentAsset = get().getAsset(parentId)
    if (!parentAsset) {
      throw new Error('Parent asset not found')
    }

    // Determine IP type based on parent
    let ipType: 'Remix' | 'Derivative' = 'Remix'
    if (parentAsset.ipType === 'Remix' || parentAsset.ipType === 'Derivative') {
      ipType = 'Derivative'
    }

    const newAsset: IPAsset = {
      ...newAssetData,
      id: generateId(),
      ipType,
      parentId,
      timestamp: Date.now(),
      derivatives: [],
    }

    // Update parent's derivatives list and add new asset
    const updatedAssets = get().assets.map((asset) =>
      asset.id === parentId
        ? { ...asset, derivatives: [...asset.derivatives, newAsset.id] }
        : asset
    )
    updatedAssets.push(newAsset)
    
    set({ assets: updatedAssets })
    saveAssets(updatedAssets)

    return newAsset
  },
}))


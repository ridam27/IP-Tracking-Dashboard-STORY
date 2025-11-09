'use client'

import { useIPStore } from '@/store/ipStore'
import { useWalletStore } from '@/store/walletStore'
import { IPAsset } from '@/types'
import { ExternalLink, Copy, DollarSign, Layers } from 'lucide-react'
import { useState } from 'react'

interface AssetListProps {
  assets: IPAsset[]
  onRemix?: (assetId: string) => void
  onViewDetails?: (assetId: string) => void
}

export default function AssetList({ assets, onRemix, onViewDetails }: AssetListProps) {
  const { address } = useWalletStore()

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Original':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
      case 'Remix':
        return 'bg-green-500/20 text-green-400 border-green-500/50'
      case 'Derivative':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/50'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  if (assets.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>No assets found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {assets.map((asset) => (
        <div
          key={asset.id}
          className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-primary-500/50 transition-colors"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-semibold text-white">{asset.title}</h3>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium border ${getTypeColor(
                    asset.ipType
                  )}`}
                >
                  {asset.ipType}
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-3">{asset.description}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {asset.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-slate-700/50 text-gray-300 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">License</p>
              <p className="text-sm text-white font-medium">{asset.licenseType}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Creator</p>
              <div className="flex items-center gap-2">
                <p className="text-sm text-white font-mono">{formatAddress(asset.creator)}</p>
                <button
                  onClick={() => copyToClipboard(asset.creator)}
                  className="text-gray-400 hover:text-white"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Royalties</p>
              <p className="text-sm text-white font-medium">{asset.royalties.percentage}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Derivatives</p>
              <div className="flex items-center gap-1">
                <Layers className="w-4 h-4 text-gray-400" />
                <p className="text-sm text-white font-medium">{asset.derivatives.length}</p>
              </div>
            </div>
          </div>

          {asset.tokenId && (
            <div className="mb-4 p-3 bg-slate-900/50 rounded border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Token ID</p>
                  <p className="text-sm text-white font-mono">{formatAddress(asset.tokenId)}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(asset.tokenId!)}
                  className="text-gray-400 hover:text-white"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {onViewDetails && (
              <button
                onClick={() => onViewDetails(asset.id)}
                className="px-4 py-2 bg-primary-600/20 hover:bg-primary-600/30 border border-primary-500/50 rounded-lg text-primary-400 text-sm transition-colors"
              >
                View Details
              </button>
            )}
            {onRemix && asset.licenseType !== 'CC0' && (
              <button
                onClick={() => onRemix(asset.id)}
                className="px-4 py-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/50 rounded-lg text-green-400 text-sm transition-colors"
              >
                Create Remix
              </button>
            )}
            {asset.fileUrl && (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  if (asset.fileUrl?.startsWith('#mock-ipfs-')) {
                    alert('This is a mock IPFS URL. In production, this would link to the actual file on IPFS.')
                  } else {
                    window.open(asset.fileUrl, '_blank', 'noopener,noreferrer')
                  }
                }}
                className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg text-gray-300 text-sm transition-colors flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                {asset.fileUrl?.startsWith('#mock-ipfs-') ? 'View File (Mock)' : 'View File'}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}


'use client'

import { useIPStore } from '@/store/ipStore'
import { X, Calendar, User, Tag, FileText, DollarSign, Layers } from 'lucide-react'

interface IPDetailModalProps {
  assetId: string
  onClose: () => void
  onRemix?: (assetId: string) => void
}

export default function IPDetailModal({ assetId, onClose, onRemix }: IPDetailModalProps) {
  const { getAsset, getDerivatives } = useIPStore()
  const asset = getAsset(assetId)
  const derivatives = asset ? getDerivatives(assetId) : []

  if (!asset) {
    return null
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 10)}...${addr.slice(-8)}`
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">{asset.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Description
            </h3>
            <p className="text-white">{asset.description || 'No description provided'}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Creator
              </h3>
              <p className="text-white font-mono text-sm">{formatAddress(asset.creator)}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Created
              </h3>
              <p className="text-white text-sm">{formatDate(asset.timestamp)}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">License Type</h3>
              <p className="text-white font-medium">{asset.licenseType}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Royalties
              </h3>
              <p className="text-white font-medium">{asset.royalties.percentage}%</p>
              <p className="text-gray-400 text-xs">Total Earned: {asset.royalties.totalEarned.toFixed(4)} ETH</p>
            </div>
          </div>

          {asset.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {asset.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-primary-600/20 text-primary-400 text-sm rounded-full border border-primary-500/50"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {asset.fileUrl && (
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">File</h3>
              {asset.fileUrl.startsWith('#mock-ipfs-') ? (
                <div>
                  <p className="text-gray-400 text-sm mb-2">
                    Mock IPFS URL (for demo purposes)
                  </p>
                  <p className="text-primary-400 text-sm break-all font-mono">
                    {asset.fileUrl.replace('#mock-ipfs-', 'IPFS Hash: ')}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    In production, this would be a real IPFS gateway URL
                  </p>
                </div>
              ) : (
                <a
                  href={asset.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-400 hover:text-primary-300 text-sm break-all"
                >
                  {asset.fileUrl}
                </a>
              )}
            </div>
          )}

          {asset.tokenId && (
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Token ID</h3>
              <p className="text-white font-mono text-sm break-all">{asset.tokenId}</p>
            </div>
          )}

          {derivatives.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Derivatives ({derivatives.length})
              </h3>
              <div className="space-y-2">
                {derivatives.map((derivative) => (
                  <div
                    key={derivative.id}
                    className="p-3 bg-slate-800/50 border border-slate-700 rounded"
                  >
                    <p className="text-white font-medium">{derivative.title}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      {derivative.ipType} • {formatDate(derivative.timestamp)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {onRemix && asset.licenseType !== 'CC0' && (
            <div className="pt-4 border-t border-slate-700">
              <button
                onClick={() => {
                  onRemix(asset.id)
                  onClose()
                }}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
              >
                Create Remix of This IP
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


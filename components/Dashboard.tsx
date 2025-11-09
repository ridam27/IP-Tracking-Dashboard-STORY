'use client'

import { useState, useEffect } from 'react'
import { useWalletStore } from '@/store/walletStore'
import { useIPStore } from '@/store/ipStore'
import { useToastStore } from '@/store/toastStore'
import { generateSampleData } from '@/lib/sampleData'
import WalletConnect from './WalletConnect'
import IPRegistrationForm from './IPRegistrationForm'
import IPGraph from './IPGraph'
import AssetList from './AssetList'
import IPDetailModal from './IPDetailModal'
import { Plus, LayoutGrid, List, Network, Sparkles, TrendingUp, Database } from 'lucide-react'

type ViewMode = 'graph' | 'list' | 'register' | 'my-assets' | 'discover'

export default function Dashboard() {
  const { isConnected, address, checkConnection } = useWalletStore()
  const { assets, getAssetsByCreator, addAsset } = useIPStore()
  const { showToast } = useToastStore()
  const [viewMode, setViewMode] = useState<ViewMode>('graph')
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null)
  const [remixParentId, setRemixParentId] = useState<string | null>(null)

  // Check wallet connection on mount
  useEffect(() => {
    checkConnection()
  }, [checkConnection])

  const loadSampleData = () => {
    const sampleData = generateSampleData()
    sampleData.forEach((asset) => {
      addAsset(asset)
    })
    showToast('Sample data loaded successfully!', 'success')
  }

  const myAssets = address ? getAssetsByCreator(address) : []
  const publicAssets = assets.filter((asset) => !address || asset.creator.toLowerCase() !== address.toLowerCase())

  const stats = {
    totalIPs: assets.length,
    myIPs: myAssets.length,
    totalDerivatives: assets.filter((a) => a.ipType !== 'Original').length,
    totalRevenue: myAssets.reduce((sum, asset) => sum + asset.royalties.totalEarned, 0),
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Story IP Dashboard</h1>
                <p className="text-xs text-gray-400">Visualize, Manage, and Monetize Your Creative Graph</p>
              </div>
            </div>
            <WalletConnect />
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-slate-900/50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Total IPs</p>
              <p className="text-2xl font-bold text-white">{stats.totalIPs}</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">My IPs</p>
              <p className="text-2xl font-bold text-white">{stats.myIPs}</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Derivatives</p>
              <p className="text-2xl font-bold text-white">{stats.totalDerivatives}</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Total Revenue
              </p>
              <p className="text-2xl font-bold text-white">{stats.totalRevenue.toFixed(4)} ETH</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-slate-900/30 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-3">
            <button
              onClick={() => setViewMode('graph')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                viewMode === 'graph'
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-800/50 text-gray-300 hover:bg-slate-700'
              }`}
            >
              <Network className="w-4 h-4" />
              IP Graph
            </button>
            <button
              onClick={() => setViewMode('my-assets')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                viewMode === 'my-assets'
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-800/50 text-gray-300 hover:bg-slate-700'
              }`}
            >
              <List className="w-4 h-4" />
              My Assets
            </button>
            <button
              onClick={() => setViewMode('discover')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                viewMode === 'discover'
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-800/50 text-gray-300 hover:bg-slate-700'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Discover
            </button>
            <button
              onClick={() => {
                setRemixParentId(null)
                setViewMode('register')
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                viewMode === 'register'
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-800/50 text-gray-300 hover:bg-slate-700'
              }`}
            >
              <Plus className="w-4 h-4" />
              Register IP
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === 'graph' && (
          <div className="bg-slate-900/30 rounded-lg border border-slate-700 p-6 min-h-[600px] relative">
            {assets.length === 0 && (
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={loadSampleData}
                  className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 rounded-lg text-purple-400 text-sm transition-colors flex items-center gap-2"
                >
                  <Database className="w-4 h-4" />
                  Load Sample Data
                </button>
              </div>
            )}
            <IPGraph
              onNodeClick={(nodeId) => setSelectedAssetId(nodeId)}
            />
          </div>
        )}

        {viewMode === 'register' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-slate-900/30 rounded-lg border border-slate-700 p-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                {remixParentId ? 'Create Remix' : 'Register New IP'}
              </h2>
              <p className="text-gray-400 mb-6">
                {remixParentId
                  ? 'Create a remix or derivative of an existing IP asset'
                  : 'Register your intellectual property on Story Protocol'}
              </p>
              {!isConnected ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 mb-4">Please connect your wallet to register IP</p>
                  <WalletConnect />
                </div>
              ) : (
                <IPRegistrationForm
                  parentId={remixParentId || undefined}
                  onSuccess={() => {
                    setViewMode('graph')
                    setRemixParentId(null)
                  }}
                />
              )}
            </div>
          </div>
        )}

        {viewMode === 'my-assets' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">My Assets</h2>
            {!isConnected ? (
              <div className="text-center py-12 bg-slate-900/30 rounded-lg border border-slate-700">
                <p className="text-gray-400 mb-4">Please connect your wallet to view your assets</p>
                <WalletConnect />
              </div>
            ) : myAssets.length === 0 ? (
              <div className="text-center py-12 bg-slate-900/30 rounded-lg border border-slate-700">
                <p className="text-gray-400 mb-4">You haven't registered any IP assets yet</p>
                <button
                  onClick={() => setViewMode('register')}
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Register Your First IP
                </button>
              </div>
            ) : (
              <AssetList
                assets={myAssets}
                onRemix={(assetId) => {
                  setRemixParentId(assetId)
                  setViewMode('register')
                }}
                onViewDetails={(assetId) => setSelectedAssetId(assetId)}
              />
            )}
          </div>
        )}

        {viewMode === 'discover' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Discover Public IPs</h2>
            {publicAssets.length === 0 ? (
              <div className="text-center py-12 bg-slate-900/30 rounded-lg border border-slate-700">
                <p className="text-gray-400">No public IPs available yet</p>
              </div>
            ) : (
              <AssetList
                assets={publicAssets}
                onRemix={(assetId) => {
                  if (!isConnected) {
                    showToast('Please connect your wallet to create a remix', 'warning')
                    return
                  }
                  setRemixParentId(assetId)
                  setViewMode('register')
                }}
                onViewDetails={(assetId) => setSelectedAssetId(assetId)}
              />
            )}
          </div>
        )}
      </main>

      {/* IP Detail Modal */}
      {selectedAssetId && (
        <IPDetailModal
          assetId={selectedAssetId}
          onClose={() => setSelectedAssetId(null)}
          onRemix={(assetId) => {
            if (!isConnected) {
              showToast('Please connect your wallet to create a remix', 'warning')
              return
            }
            setRemixParentId(assetId)
            setViewMode('register')
            setSelectedAssetId(null)
          }}
        />
      )}
    </div>
  )
}


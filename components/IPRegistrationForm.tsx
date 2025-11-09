'use client'

import { useState, FormEvent } from 'react'
import { useWalletStore } from '@/store/walletStore'
import { useIPStore } from '@/store/ipStore'
import { useToastStore } from '@/store/toastStore'
import { StoryProtocolService } from '@/lib/storyProtocol'
import { LicenseType, IPAsset } from '@/types'
import { Upload, X, Loader2 } from 'lucide-react'

const LICENSE_TYPES: { value: LicenseType; label: string; description: string }[] = [
  { value: 'CC0', label: 'CC0 - Public Domain', description: 'No rights reserved' },
  { value: 'CC-BY', label: 'CC-BY - Attribution', description: 'Requires attribution' },
  { value: 'CC-BY-SA', label: 'CC-BY-SA - Share Alike', description: 'Attribution + Share Alike' },
  { value: 'Commercial', label: 'Commercial License', description: 'Commercial use allowed with royalties' },
  { value: 'Remix-Allowed', label: 'Remix Allowed', description: 'Can be remixed with attribution' },
  { value: 'Attribution-Only', label: 'Attribution Only', description: 'Only attribution required' },
]

const TAGS = ['AI', 'Music', 'Code', 'Art', 'Writing', 'Video', 'Design', 'Data', 'Model']

export default function IPRegistrationForm({ onSuccess, parentId }: { onSuccess?: () => void; parentId?: string }) {
  const { isConnected, address, signer } = useWalletStore()
  const { addAsset, createRemix, getAsset } = useIPStore()
  const { showToast } = useToastStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    licenseType: 'CC-BY' as LicenseType,
    tags: [] as string[],
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!isConnected || !address) {
      showToast('Please connect your wallet first', 'warning')
      return
    }

    if (!formData.title.trim()) {
      showToast('Please enter a title', 'warning')
      return
    }

    setIsSubmitting(true)

    try {
      let fileHash = ''
      let fileUrl = ''

      if (selectedFile) {
        const ipfsResult = await StoryProtocolService.uploadToIPFS(selectedFile)
        fileHash = ipfsResult.hash
        fileUrl = ipfsResult.url
      }

      const royalties = StoryProtocolService.calculateRoyalties(formData.licenseType)

      if (parentId) {
        // Creating a remix
        const newAsset = createRemix(parentId, {
          title: formData.title,
          description: formData.description,
          creator: address,
          licenseType: formData.licenseType,
          tags: formData.tags,
          fileUrl,
          fileHash,
          royalties: {
            percentage: royalties,
            totalEarned: 0,
          },
        })

        // Mock register remix on Story Protocol
        const parentAsset = getAsset(parentId)
        if (parentAsset?.tokenId) {
          await StoryProtocolService.registerRemix(parentAsset.tokenId, newAsset.id, signer)
        }
      } else {
        // Creating original IP
        const tokenId = await StoryProtocolService.mintIPAsset(
          {
            title: formData.title,
            description: formData.description,
            creator: address,
            licenseType: formData.licenseType,
            tags: formData.tags,
            ipType: 'Original',
            fileUrl,
            fileHash,
            royalties: {
              percentage: royalties,
              totalEarned: 0,
            },
          },
          signer
        )

        const newAsset: IPAsset = {
          id: `ip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: formData.title,
          description: formData.description,
          creator: address,
          licenseType: formData.licenseType,
          tags: formData.tags,
          ipType: 'Original',
          fileUrl,
          fileHash,
          timestamp: Date.now(),
          tokenId,
          royalties: {
            percentage: royalties,
            totalEarned: 0,
          },
          derivatives: [],
        }

        addAsset(newAsset)
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        licenseType: 'CC-BY',
        tags: [],
      })
      setSelectedFile(null)

      showToast(
        parentId 
          ? 'Remix created successfully!' 
          : 'IP asset registered successfully!',
        'success'
      )

      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error('Error registering IP:', error)
      showToast(
        error?.message || 'Failed to register IP asset. Please try again.',
        'error'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Enter IP title"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          rows={4}
          placeholder="Describe your IP asset"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Upload File (Optional)
        </label>
        <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
          {selectedFile ? (
            <div className="flex items-center justify-between bg-slate-800 p-3 rounded">
              <span className="text-sm text-gray-300">{selectedFile.name}</span>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="text-red-400 hover:text-red-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="cursor-pointer">
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-400">Click to upload or drag and drop</p>
              <input
                type="file"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && setSelectedFile(e.target.files[0])}
              />
            </label>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          License Type *
        </label>
        <select
          value={formData.licenseType}
          onChange={(e) => setFormData({ ...formData, licenseType: e.target.value as LicenseType })}
          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {LICENSE_TYPES.map((license) => (
            <option key={license.value} value={license.value}>
              {license.label} - {license.description}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Tags
        </label>
        <div className="flex flex-wrap gap-2">
          {TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                formData.tags.includes(tag)
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !isConnected}
        className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {parentId ? 'Creating Remix...' : 'Minting IP...'}
          </>
        ) : (
          parentId ? 'Create Remix' : 'Register IP'
        )}
      </button>
    </form>
  )
}


import { IPAsset } from '@/types'

export function generateSampleData(): IPAsset[] {
  const now = Date.now()
  const sampleAddresses = [
    '0x1234567890123456789012345678901234567890',
    '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    '0x9876543210987654321098765432109876543210',
  ]

  const sampleAssets: IPAsset[] = [
    {
      id: 'sample_1',
      title: 'Original AI Model',
      description: 'A foundational machine learning model for image recognition',
      creator: sampleAddresses[0],
      licenseType: 'Commercial',
      tags: ['AI', 'Model', 'Code'],
      ipType: 'Original',
      timestamp: now - 86400000 * 7, // 7 days ago
      tokenId: '0x' + Math.random().toString(16).substr(2, 64),
      royalties: {
        percentage: 10,
        totalEarned: 0.5,
      },
      derivatives: ['sample_2', 'sample_3'],
    },
    {
      id: 'sample_2',
      title: 'Remix: Enhanced AI Model',
      description: 'Improved version with better accuracy',
      creator: sampleAddresses[1],
      licenseType: 'CC-BY-SA',
      tags: ['AI', 'Model'],
      ipType: 'Remix',
      parentId: 'sample_1',
      timestamp: now - 86400000 * 5, // 5 days ago
      tokenId: '0x' + Math.random().toString(16).substr(2, 64),
      royalties: {
        percentage: 3,
        totalEarned: 0.2,
      },
      derivatives: ['sample_4'],
    },
    {
      id: 'sample_3',
      title: 'Remix: Mobile AI Model',
      description: 'Optimized for mobile devices',
      creator: sampleAddresses[2],
      licenseType: 'Remix-Allowed',
      tags: ['AI', 'Model', 'Mobile'],
      ipType: 'Remix',
      parentId: 'sample_1',
      timestamp: now - 86400000 * 4, // 4 days ago
      tokenId: '0x' + Math.random().toString(16).substr(2, 64),
      royalties: {
        percentage: 5,
        totalEarned: 0.15,
      },
      derivatives: [],
    },
    {
      id: 'sample_4',
      title: 'Derivative: Production AI Model',
      description: 'Production-ready version of the enhanced model',
      creator: sampleAddresses[0],
      licenseType: 'Commercial',
      tags: ['AI', 'Model', 'Production'],
      ipType: 'Derivative',
      parentId: 'sample_2',
      timestamp: now - 86400000 * 2, // 2 days ago
      tokenId: '0x' + Math.random().toString(16).substr(2, 64),
      royalties: {
        percentage: 10,
        totalEarned: 0.1,
      },
      derivatives: [],
    },
  ]

  return sampleAssets
}


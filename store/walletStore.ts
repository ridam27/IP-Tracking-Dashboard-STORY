import { create } from 'zustand'
import { ethers } from 'ethers'

interface WalletState {
  isConnected: boolean
  address: string | null
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
  chainId: number | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  checkConnection: () => Promise<void>
}

export const useWalletStore = create<WalletState>((set, get) => ({
  isConnected: false,
  address: null,
  provider: null,
  signer: null,
  chainId: null,
  connectWallet: async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      const { useToastStore } = await import('@/store/toastStore')
      useToastStore.getState().showToast('Please install MetaMask to connect your wallet', 'error')
      return
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      await provider.send('eth_requestAccounts', [])
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      const network = await provider.getNetwork()

      set({
        isConnected: true,
        address,
        provider,
        signer,
        chainId: Number(network.chainId),
      })

      const { useToastStore } = await import('@/store/toastStore')
      useToastStore.getState().showToast('Wallet connected successfully!', 'success')
    } catch (error: any) {
      console.error('Error connecting wallet:', error)
      const { useToastStore } = await import('@/store/toastStore')
      useToastStore.getState().showToast(
        error?.message || 'Failed to connect wallet. Please try again.',
        'error'
      )
    }
  },
  disconnectWallet: () => {
    set({
      isConnected: false,
      address: null,
      provider: null,
      signer: null,
      chainId: null,
    })
  },
  checkConnection: async () => {
    if (typeof window === 'undefined' || !window.ethereum) return

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.send('eth_accounts', [])
      
      if (accounts.length > 0 && !get().isConnected) {
        const signer = await provider.getSigner()
        const address = await signer.getAddress()
        const network = await provider.getNetwork()

        set({
          isConnected: true,
          address,
          provider,
          signer,
          chainId: Number(network.chainId),
        })
      }
    } catch (error) {
      console.error('Error checking connection:', error)
    }
  },
}))


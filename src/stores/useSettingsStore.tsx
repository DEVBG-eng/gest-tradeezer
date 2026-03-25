import React, { createContext, useContext, useState, ReactNode } from 'react'

export type CloudProvider = 'google_drive' | 'dropbox' | 'onedrive' | null

interface SettingsStoreContext {
  activeCloudProvider: CloudProvider
  setActiveCloudProvider: (provider: CloudProvider) => void
  connectedProviders: NonNullable<CloudProvider>[]
  toggleProviderConnection: (provider: NonNullable<CloudProvider>) => void
  providerEmails: Record<string, string>
}

const StoreContext = createContext<SettingsStoreContext | null>(null)

export const SettingsStoreProvider = ({ children }: { children: ReactNode }) => {
  const [activeCloudProvider, setActiveCloudProvider] = useState<CloudProvider>('google_drive')
  const [connectedProviders, setConnectedProviders] = useState<NonNullable<CloudProvider>[]>([
    'google_drive',
  ])

  const [providerEmails] = useState<Record<string, string>>({
    google_drive: 'admin@tradeezer.com',
    dropbox: 'admin@tradeezer.com',
    onedrive: 'admin@tradeezer.onmicrosoft.com',
  })

  const toggleProviderConnection = (provider: NonNullable<CloudProvider>) => {
    setConnectedProviders((prev) => {
      const isConnected = prev.includes(provider)
      if (isConnected) {
        const next = prev.filter((p) => p !== provider)
        if (activeCloudProvider === provider) {
          setActiveCloudProvider(next[0] || null)
        }
        return next
      } else {
        return [...prev, provider]
      }
    })
  }

  return (
    <StoreContext.Provider
      value={{
        activeCloudProvider,
        setActiveCloudProvider,
        connectedProviders,
        toggleProviderConnection,
        providerEmails,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export default function useSettingsStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useSettingsStore must be used within SettingsStoreProvider')
  return ctx
}

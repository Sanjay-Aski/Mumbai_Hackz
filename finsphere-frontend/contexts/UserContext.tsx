"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { UserProfile } from '@/lib/api'

interface UserContextType {
  selectedUser: UserProfile | null
  setSelectedUser: (user: UserProfile | null) => void
  isUserSelected: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)

  const contextValue: UserContextType = {
    selectedUser,
    setSelectedUser,
    isUserSelected: selectedUser !== null
  }

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export default UserContext
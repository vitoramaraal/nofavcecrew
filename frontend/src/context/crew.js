import { createContext, useContext } from 'react'

export const CrewContext = createContext()

export function useCrew() {
  return useContext(CrewContext)
}

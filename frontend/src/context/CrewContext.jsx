import { useState } from 'react'

import {
  crewStats,
  members,
  events,
  drops,
  applications,
} from '../data/crewData'
import { CrewContext } from './crew'

export function CrewProvider({ children }) {
  const [stats] = useState(crewStats)

  const [crewMembers, setCrewMembers] = useState(members)

  const [crewEvents] = useState(events)

  const [crewDrops] = useState(drops)

  const [crewApplications, setCrewApplications] =
    useState(applications)

  function approveApplication(id) {
    setCrewApplications((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, status: 'Approved' }
          : item,
      ),
    )
  }

  function rejectApplication(id) {
    setCrewApplications((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, status: 'Rejected' }
          : item,
      ),
    )
  }

  return (
    <CrewContext.Provider
      value={{
        stats,

        crewMembers,
        setCrewMembers,

        crewEvents,

        crewDrops,

        crewApplications,

        approveApplication,
        rejectApplication,
      }}
    >
      {children}
    </CrewContext.Provider>
  )
}


import { createContext, useContext } from 'react'

const DashboardThemeContext = createContext('light')

export const useDashboardTheme = () => useContext(DashboardThemeContext)

export default DashboardThemeContext

import { useEffect } from "react"
import useSetIsSidebarOpen from "../../../../../hooks/useSetIsSidebarOpen"

const Move = () => {
  const setIsSidebarOpen = useSetIsSidebarOpen()
  useEffect(() => {}, [setIsSidebarOpen(false)])
  return null
}

export default Move

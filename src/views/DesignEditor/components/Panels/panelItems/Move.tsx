import { useEffect } from "react"
import { useSetRecoilState } from "recoil"
import { isSidebarOpenState } from "../../../../../state/designEditor"

const Move = () => {
  const setIsSidebarOpen = useSetRecoilState(isSidebarOpenState)
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [])
  return null
}

export default Move

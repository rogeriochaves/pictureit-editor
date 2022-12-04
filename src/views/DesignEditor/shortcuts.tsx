import { useEffect } from "react"
import { useEditor } from "@layerhub-io/react"
import useAppContext from "../../hooks/useAppContext"
import { ToolType } from "../../constants/app-options"

const Shortcuts = () => {
  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0
  const editor = useEditor()
  const { setActiveTool } = useAppContext()

  const handleShortcuts = (event: KeyboardEvent) => {
    const shortcuts = [
      {
        keys: ["CMD", "Z"],
        action: editor.history.undo,
      },
      {
        keys: ["CMD", "SHIFT", "Z"],
        action: editor.history.redo,
      },
      {
        keys: ["CTRL", "R"],
        isMac: true,
        action: editor.history.redo,
      },
      {
        keys: ["CTRL", "Y"],
        isMac: false,
        action: editor.history.redo,
      },
      {
        keys: ["V"],
        action: () => setActiveTool(ToolType.MOVE),
      },
      {
        keys: ["P"],
        action: () => setActiveTool(ToolType.DRAWING),
      },
    ]

    for (const shortcut of shortcuts) {
      if (shortcut.isMac !== undefined && !!shortcut.isMac !== isMac) continue

      const combination = {
        meta: false,
        ctrl: false,
        shift: false,
        key: "",
      }
      for (const key of shortcut.keys) {
        switch (key) {
          case "CMD":
            combination.meta = true
            break
          case "CTRL":
            combination.ctrl = true
            break
          case "SHIFT":
            combination.shift = true
            break
          default:
            combination.key = key
            break
        }
      }

      const eventMetaKey = isMac ? event.metaKey : event.ctrlKey
      const trigger =
        eventMetaKey == combination.meta &&
        event.ctrlKey == combination.ctrl &&
        event.shiftKey == combination.shift &&
        event.key.toUpperCase() == combination.key

      if (trigger) {
        shortcut.action()
        event.preventDefault()
        event.stopImmediatePropagation()
        break
      }
    }
  }

  useEffect(() => {
    if (!editor) return
    document.addEventListener("keydown", handleShortcuts)

    return () => {
      document.removeEventListener("keydown", handleShortcuts)
    }
  }, [editor])

  return null
}

export default Shortcuts

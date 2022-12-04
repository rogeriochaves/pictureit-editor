import { useCallback, useEffect } from "react"
import { useEditor } from "@layerhub-io/react"
import { useSetRecoilState } from "recoil"
import { activeToolState, ToolType } from "../../state/designEditor"

const Shortcuts = () => {
  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0
  const editor = useEditor()
  const setActiveTool = useSetRecoilState(activeToolState)

  const handleShortcuts = useCallback(
    (event: KeyboardEvent) => {
      if (!editor) return
      if ((event.target as HTMLElement).tagName == "INPUT" || (event.target as HTMLElement).tagName == "TEXTAREA") {
        return
      }

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
    },
    [editor, isMac, setActiveTool]
  )

  useEffect(() => {
    if (!editor) return
    document.addEventListener("keydown", handleShortcuts)

    return () => {
      document.removeEventListener("keydown", handleShortcuts)
    }
  }, [editor, handleShortcuts])

  return null
}

export default Shortcuts

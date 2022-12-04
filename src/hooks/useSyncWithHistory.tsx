import { useEditor } from "@layerhub-io/react"
import { useCallback, useEffect, useState } from "react"

type StateTuple<T> = [T, (t: ((currVal: T) => T) | T) => void]

export const useSyncWithHistory = (deps: { [key: string]: StateTuple<any> }) => {
  const editor = useEditor()

  const amendHistory = useCallback(() => {
    if (!editor) return

    const extras = Object.fromEntries(Object.entries(deps).map(([key, [value]]) => [key, value]))
    editor.history.amend(extras)
  }, [deps, editor])

  useEffect(() => {
    amendHistory()
  }, [amendHistory])

  const restoreState = useCallback(
    ({ extras }: { extras: { [key: string]: unknown } }) => {
      for (const [key, [_, setValue]] of Object.entries(deps)) {
        if (key in extras) {
          setValue(extras[key])
        }
      }
    },
    [deps]
  )

  useEffect(() => {
    if (!editor) return

    editor.on("history:restored", restoreState)
    return () => {
      editor.off("history:restored", restoreState)
    }
  }, [editor, restoreState])
}

import React from "react"
import { LightTheme, ThemeProvider } from "baseui"
import { Drawer, SIZE } from "baseui/drawer"
import { Button, KIND } from "baseui/button"
import { useSelector } from "react-redux"
import { nanoid } from "nanoid"
import { RootState, useAppDispatch } from "./store/store"
import { addPage } from "./store/design-editor"

const Pages = () => {
  const [isOpen, setIsOpen] = React.useState(false)
  const pages = useSelector((state: RootState) => state.designEditor.pages)
  const dispatch = useAppDispatch()
  const handleAddPage = () => {
    dispatch(
      addPage({
        id: nanoid(),
        name: "New page",
      })
    )
  }
  return (
    //@ts-ignore
    <ThemeProvider theme={LightTheme}>
      <Button
        onClick={() => setIsOpen(true)}
        kind={KIND.secondary}
        //@ts-ignore
        $style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          zIndex: 1,
          display: isOpen ? "none" : "block",
        }}
      >
        Pages
      </Button>
      <Drawer size={SIZE.auto} isOpen={isOpen} autoFocus onClose={() => setIsOpen(false)}>
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "grid", gap: "1rem", padding: "1rem 0" }}>
            {pages.map((page, index) => {
              return (
                <div
                  style={{
                    width: "180px",
                    height: "60px",
                    border: "1px solid gray",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  key={page.id}
                >
                  Page {index}
                </div>
              )
            })}
          </div>

          <Button onClick={handleAddPage}>Add Page</Button>
        </div>
      </Drawer>
    </ThemeProvider>
  )
}

export default Pages

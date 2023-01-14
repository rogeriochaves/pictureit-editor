import { useEditor } from "@layerhub-io/react"
import { IScene } from "@layerhub-io/types"
import { DarkTheme, styled, ThemeProvider } from "baseui"
import { Block } from "baseui/block"
import { Button, KIND, SIZE } from "baseui/button"
import { StatefulMenu } from "baseui/menu"
import { PLACEMENT, StatefulPopover } from "baseui/popover"
import { Theme } from "baseui/theme"
import React, { useCallback, useRef } from "react"
import { useRecoilValue, useRecoilValueLoadable, useSetRecoilState } from "recoil"
import Github from "~/components/Icons/Github"
import Logo from "~/components/Icons/Logo"
import Play from "~/components/Icons/Play"
import useDesignEditorContext from "~/hooks/useDesignEditorContext"
import { IDesign } from "~/interfaces/DesignEditor"
import { loadTemplateFonts } from "~/utils/fonts"
import { loadVideoEditorAssets } from "~/utils/video-parser"
import api, { isPictureIt } from "../../../../api"
import { PICTURE_IT_URL } from "../../../../api/adapters/pictureit"
import { useExportToJSON } from "../../../../hooks/useSaveLoad"
import { displayPreviewState, editorTypeState } from "../../../../state/designEditor"
import { changesWithoutExportingState } from "../../../../state/file"
import { currentUserQuery } from "../../../../state/user"
import DesignTitle from "./DesignTitle"

const Container = styled<"div", object, Theme>("div", ({ $theme }) => ({
  height: "64px",
  background: $theme.colors.black,
  display: "grid",
  padding: "0 1.25rem",
  gridTemplateColumns: "380px 1fr 380px",
  alignItems: "center",
}))

const Navbar = () => {
  const { setScenes, setCurrentDesign, currentDesign, scenes } = useDesignEditorContext()
  const setDisplayPreview = useSetRecoilState(displayPreviewState)
  const editorType = useRecoilValue(editorTypeState)
  const editor = useEditor()
  const inputFileRef = useRef<HTMLInputElement>(null)
  const user = useRecoilValueLoadable(currentUserQuery)
  const exportToJSON = useExportToJSON()
  const setChangesWithoutExporting = useSetRecoilState(changesWithoutExportingState)

  const parseGraphicJSON = () => {
    setChangesWithoutExporting(false)
    makeDownload(exportToJSON())
  }

  const parsePresentationJSON = () => {
    const currentScene = editor!.scene.exportToJSON()

    const updatedScenes = scenes.map((scn) => {
      if (scn.id === currentScene.id) {
        return {
          id: currentScene.id,
          duration: 5000,
          layers: currentScene.layers,
          name: currentScene.name,
        }
      }
      return {
        id: scn.id,
        duration: 5000,
        layers: scn.layers,
        name: scn.name,
      }
    })

    if (currentDesign) {
      const presentationTemplate: IDesign = {
        id: currentDesign.id,
        name: currentDesign.name,
        frame: currentDesign.frame,
        scenes: updatedScenes,
        metadata: {},
        preview: "",
      }
      makeDownload(presentationTemplate)
    } else {
      console.log("NO CURRENT DESIGN")
    }
  }

  const parseVideoJSON = () => {
    const currentScene = editor!.scene.exportToJSON()
    const updatedScenes = scenes.map((scn) => {
      if (scn.id === currentScene.id) {
        return {
          id: scn.id,
          duration: scn.duration,
          layers: currentScene.layers,
          name: currentScene.name ? currentScene.name : "",
        }
      }
      return {
        id: scn.id,
        duration: scn.duration,
        layers: scn.layers,
        name: scn.name ? scn.name : "",
      }
    })
    if (currentDesign) {
      const videoTemplate: IDesign = {
        id: currentDesign.id,
        name: currentDesign.name,
        frame: currentDesign.frame,
        scenes: updatedScenes,
        metadata: {},
        preview: "",
      }
      makeDownload(videoTemplate)
    } else {
      console.log("NO CURRENT DESIGN")
    }
  }

  const makeDownload = (data: object) => {
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data))}`
    const a = document.createElement("a")
    a.href = dataStr
    a.download = "template.json"
    a.click()
  }

  const makeDownloadTemplate = async () => {
    if (editor) {
      if (editorType === "GRAPHIC") {
        return parseGraphicJSON()
      } else if (editorType === "PRESENTATION") {
        return parsePresentationJSON()
      } else {
        return parseVideoJSON()
      }
    }
  }

  const loadGraphicTemplate = async (payload: IDesign) => {
    if (!editor) return

    const scenes = []
    const { scenes: scns, ...design } = payload

    for (const scn of scns) {
      const scene: IScene = {
        name: scn.name,
        frame: payload.frame,
        id: scn.id,
        layers: scn.layers,
        metadata: {},
      }
      const loadedScene = await loadVideoEditorAssets(scene)
      await loadTemplateFonts(loadedScene)

      const preview = (await editor.renderer.render(loadedScene)) as string
      scenes.push({ ...loadedScene, preview })
    }

    return { scenes, design }
  }

  const loadPresentationTemplate = async (payload: IDesign) => {
    if (!editor) return

    const scenes = []
    const { scenes: scns, ...design } = payload

    for (const scn of scns) {
      const scene: IScene = {
        name: scn.name,
        frame: payload.frame,
        id: scn,
        layers: scn.layers,
        metadata: {},
      }
      const loadedScene = await loadVideoEditorAssets(scene)

      const preview = (await editor.renderer.render(loadedScene)) as string
      await loadTemplateFonts(loadedScene)
      scenes.push({ ...loadedScene, preview })
    }
    return { scenes, design }
  }

  const loadVideoTemplate = async (payload: IDesign) => {
    if (!editor) return

    const scenes = []
    const { scenes: scns, ...design } = payload

    for (const scn of scns) {
      const design: IScene = {
        name: "Awesome template",
        frame: payload.frame,
        id: scn.id,
        layers: scn.layers,
        metadata: {},
        duration: scn.duration,
      }
      const loadedScene = await loadVideoEditorAssets(design)

      const preview = (await editor.renderer.render(loadedScene)) as string
      await loadTemplateFonts(loadedScene)
      scenes.push({ ...loadedScene, preview })
    }
    return { scenes, design }
  }

  const handleImportTemplate = useCallback(
    async (data: any) => {
      let template
      if (data.type === "GRAPHIC") {
        template = await loadGraphicTemplate(data)
      } else if (data.type === "PRESENTATION") {
        template = await loadPresentationTemplate(data)
      } else if (data.type === "VIDEO") {
        template = await loadVideoTemplate(data)
      }
      //   @ts-ignore
      setScenes(template.scenes)
      //   @ts-ignore
      setCurrentDesign(template.design)
    },
    [editor]
  )

  const handleInputFileRefClick = () => {
    inputFileRef.current?.click()
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files![0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (res) => {
        const result = res.target!.result as string
        const design = JSON.parse(result)
        handleImportTemplate(design)
      }
      reader.onerror = (err) => {
        console.log(err)
      }

      reader.readAsText(file)
    }
  }

  const OpenSourceNavbar = () => (
    <Block $style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
      <Button
        size="compact"
        onClick={handleInputFileRefClick}
        kind={KIND.tertiary}
        overrides={{
          StartEnhancer: {
            style: {
              marginRight: "4px",
            },
          },
        }}
      >
        Import
      </Button>

      <Button
        size="compact"
        onClick={makeDownloadTemplate}
        kind={KIND.tertiary}
        overrides={{
          StartEnhancer: {
            style: {
              marginRight: "4px",
            },
          },
        }}
      >
        Export
      </Button>
      <Button
        size="compact"
        onClick={() => setDisplayPreview(true)}
        kind={KIND.tertiary}
        overrides={{
          StartEnhancer: {
            style: {
              marginRight: "4px",
            },
          },
        }}
      >
        <Play size={24} />
      </Button>

      <Button size="compact" onClick={() => (document.location = "https://github.com/")} kind={KIND.tertiary}>
        <Github size={24} />
      </Button>
    </Block>
  )

  const AccountMenu = () => {
    const firstLetter = ((user.contents?.name || user.contents?.email || "")[0] || "").toUpperCase()
    return (
      <Block $style={{ marginLeft: "0.5rem" }}>
        <StatefulPopover
          showArrow={false}
          placement={PLACEMENT.bottomRight}
          content={() => (
            <StatefulMenu
              onItemSelect={({ item }) => {
                if (item.action == "files") {
                  document.location = `${PICTURE_IT_URL}/files`
                }
                if (item.action == "account") {
                  document.location = `${PICTURE_IT_URL}/account`
                }
                if (item.action == "logout") {
                  document.location = `${PICTURE_IT_URL}/logout`
                }
              }}
              items={{
                __ungrouped: [],
                [user.contents?.name]: [
                  { label: "Artworks", action: "files" },
                  { label: "Account", action: "account" },
                  { label: "Logout", action: "logout" },
                ],
              }}
              overrides={{
                List: {
                  style: {
                    background: "#FFF"
                  },
                },
                OptgroupHeader: {
                  style: {
                    color: "#666",
                    padding: "4px 12px 12px 12px",
                  }
                },
                Option: {
                  props: {
                    getSelection: () => {},
                    getItemLabel: (item: any) =>
                      item.text ? (
                        <Block display="flex" justifyContent="space-between" style={{ background: "#FFF" }}>
                          <Block>{item.label}</Block>
                        </Block>
                      ) : (
                        item.label
                      ),
                  },
                },
              }}
            />
          )}
        >
          <Button
            style={{ width: "36px", height: "36px", borderRadius: "100%" }}
            size="compact"
            onClick={() => {
              document.location = `${PICTURE_IT_URL}/account`
            }}
            kind={KIND.primary}
          >
            {firstLetter}
          </Button>
        </StatefulPopover>
      </Block>
    )
  }

  const PictureItNavbar = () => (
    <Block $style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
      <Button
        style={{ gap: "4px" }}
        size="compact"
        onClick={() => setDisplayPreview(true)}
        kind={KIND.secondary}
        overrides={{
          StartEnhancer: {
            style: {
              marginRight: "4px",
            },
          },
        }}
      >
        <Play size={24} />
        Publish
      </Button>
      {user.state != "hasError" && <AccountMenu />}
    </Block>
  )

  const FilesMenu = () => (
    <Block $style={{ width: "36px" }}>
      <StatefulPopover
        showArrow={false}
        placement={PLACEMENT.bottomLeft}
        content={() => (
          <StatefulMenu
            onItemSelect={({ item }) => {
              if (item.action == "files") {
                document.location = `${PICTURE_IT_URL}/files`
              }
            }}
            items={[
              { label: "Back to artworks", action: "files" },
              { label: "File", arrow: true, action: "submenu-file" },
            ]}
            overrides={{
              Option: {
                props: {
                  getItemLabel: (item: any) =>
                    item.arrow ? (
                      <Block display="flex" justifyContent="space-between">
                        <Block>{item.label}</Block>
                        <Block>▸</Block>
                      </Block>
                    ) : (
                      item.label
                    ),
                  getChildMenu: (item: any) => {
                    if (item.action === "submenu-file") {
                      return (
                        <StatefulMenu
                          onItemSelect={({ item }) => {
                            if (item.action == "export") {
                              makeDownloadTemplate()
                            } else if (item.action == "import") {
                              handleInputFileRefClick()
                            }
                          }}
                          items={[
                            { label: "Save local copy", action: "export" },
                            { label: "Open local file", action: "import" },
                          ]}
                        />
                      )
                    }
                  },
                },
              },
            }}
          />
        )}
      >
        <Button kind={KIND.tertiary} size={SIZE.compact} style={{ width: "auto" }}>
          <Logo size={36} />
        </Button>
      </StatefulPopover>
    </Block>
  )

  return (
    // @ts-ignore
    <ThemeProvider theme={DarkTheme}>
      <Container $style={{ padding: "0 1.25rem 0 12px" }}>
        <input
          multiple={false}
          onChange={handleFileInput}
          type="file"
          id="file"
          ref={inputFileRef}
          style={{ display: "none" }}
        />
        {isPictureIt() ? <FilesMenu /> : <Logo size={36} />}
        <DesignTitle />
        {isPictureIt() ? <PictureItNavbar /> : <OpenSourceNavbar />}
      </Container>
    </ThemeProvider>
  )
}

export default Navbar

import { Editor } from "@layerhub-io/core"
import { useEditor } from "@layerhub-io/react"
import { IScene } from "@layerhub-io/types"
import { Block } from "baseui/block"
import { Button, KIND as BUTTON_KIND, SIZE as BUTTON_SIZE } from "baseui/button"
import { Spinner, SIZE as SPINNER_SIZE } from "baseui/spinner"
import { Input, SIZE } from "baseui/input"
import { Modal, ModalBody, ROLE, SIZE as MODAL_SIZE } from "baseui/modal"
import { KIND, Notification } from "baseui/notification"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { useRecoilState, useRecoilValue } from "recoil"
import { isPictureIt } from "../../../../api"
import { currentDesignState, publishTitleState, scenesState } from "../../../../state/designEditor"
import { publishPictureCall } from "../../../../state/publish"
import { lazySelector, useRecoilLazyLoadable } from "../../../../utils/lazySelectorFamily"
import { buildVideo } from "../../../../utils/video-builder"
import { ButtonGroup } from "baseui/button-group"
import Loop from "../../../../components/Icons/Loop"
import Boomerang from "../../../../components/Icons/Boomerang"
import { PLACEMENT, StatefulTooltip } from "baseui/tooltip"
import { StatefulPopover } from "baseui/popover"
import { Slider } from "baseui/slider"
import { debounce } from "lodash"

interface ComponentProps {
  isOpen: boolean
  setIsOpen: (v: boolean) => void
}
const Preview = ({ isOpen, setIsOpen }: ComponentProps) => {
  return (
    <Modal
      onClose={() => setIsOpen(false)}
      closeable
      isOpen={isOpen}
      animate
      autoFocus
      size={MODAL_SIZE.full}
      role={ROLE.dialog}
      overrides={{
        Root: {
          style: {
            zIndex: 130,
          },
        },
        Dialog: {
          style: {
            marginTop: 0,
            marginLeft: 0,
            marginRight: 0,
            marginBottom: 0,
            borderTopRightRadius: 0,
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
          },
        },
      }}
    >
      <ModalBody
        $style={{
          display: "flex",
          flexDirection: "column",
          marginTop: 0,
          marginLeft: 0,
          marginRight: 0,
          marginBottom: 0,
          height: "100%",
          position: "relative",
        }}
      >
        <Block
          $style={{
            position: "absolute",
            flex: 1,
            height: "100%",
            width: "100%",
            display: "flex",
          }}
        >
          <PreviewContent />
        </Block>
      </ModalBody>
    </Modal>
  )
}

const buildVideoPreviewCall = lazySelector({
  key: "videoPreviewCall",
  get:
    () =>
    async ({
      editor,
      scenes,
      boomerang,
      framesPerSecond,
    }: {
      editor: Editor
      scenes: IScene[]
      boomerang: boolean
      framesPerSecond: number
    }) => {
      let images = []
      for (const scene of scenes) {
        const preview = await editor.renderer.toDataURL(scene, {}, "image/jpeg", 0.8)
        images.push(preview)
      }
      if (boomerang) {
        images = images.concat(images.slice(1).reverse().slice(1))
      }
      return await buildVideo(images, framesPerSecond)
    },
})

type VideoControls = {
  loop: boolean
  boomerang: boolean
  framesPerSecond: number
}

const PreviewContent = () => {
  const editor = useEditor()
  const [image, setImage] = useState("")
  const [publishTitle, setPublishTitle] = useRecoilState(publishTitleState)
  const currentDesign = useRecoilValue(currentDesignState)
  const [publishRequest, publish] = useRecoilLazyLoadable(publishPictureCall)

  const scenes = useRecoilValue(scenesState)
  const supportsVideo = scenes.length > 1
  const [previewType, setPreviewType] = useState<"image" | "video">(supportsVideo ? "video" : "image")
  const [videoUrl, buildVideoPreview] = useRecoilLazyLoadable(buildVideoPreviewCall)
  const [videoControls, setVideoControls] = useState<VideoControls>({
    loop: true,
    boomerang: false,
    framesPerSecond: 10,
  })
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const buildImagePreview = useCallback(async () => {
    if (editor) {
      const template = editor.scene.exportToJSON()
      const image = (await editor.renderer.render(template)) as string
      setImage(image)
    }
  }, [editor])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedBuildVideoPreview = useCallback(
    debounce(async (editor, scenes, boomerang, framesPerSecond) => {
      await buildVideoPreview({ editor, scenes, boomerang, framesPerSecond })
    }, 300),
    []
  )

  useEffect(() => {
    if (!editor) return

    debouncedBuildVideoPreview(editor, scenes, videoControls.boomerang, videoControls.framesPerSecond)
  }, [debouncedBuildVideoPreview, editor, scenes, videoControls.boomerang, videoControls.framesPerSecond])

  useEffect(() => {
    buildImagePreview()
    if (!publishTitle) {
      setPublishTitle(currentDesign.name)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const imageOrVideoPreviewBlock = () => {
    const imagePreview = <img width="auto" height="100%" src={image} />

    if (previewType == "video") {
      if (videoUrl.state == "hasValue") {
        return <video ref={videoRef} src={videoUrl.contents} autoPlay loop={videoControls.loop} controls={true} />
      } else if (videoUrl.state == "hasError") {
        return <Overlay content={<div>Error trying to render video</div>}>{imagePreview}</Overlay>
      } else if (videoUrl.state == "loading") {
        return (
          <Overlay
            content={
              <>
                <Spinner $size={SPINNER_SIZE.large} />
                <div>Rendering video...</div>
              </>
            }
          >
            {imagePreview}
          </Overlay>
        )
      }
    }
    return imagePreview
  }

  return (
    <Block $style={{ flex: 1, alignItems: "center", justifyContent: "center", display: "flex", padding: "5rem" }}>
      <Block $style={{ maxWidth: "1200px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <Block $style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          <Block display="flex" flexDirection="column" gridGap="24px" alignItems="center">
            <ButtonGroup>
              <Button
                kind={BUTTON_KIND.secondary}
                style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                isSelected={previewType == "video"}
                onClick={() => setPreviewType("video")}
              >
                Video
              </Button>
              <Button
                kind={BUTTON_KIND.secondary}
                style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                isSelected={previewType == "image"}
                onClick={() => setPreviewType("image")}
              >
                Image
              </Button>
            </ButtonGroup>
            {imageOrVideoPreviewBlock()}
          </Block>

          {isPictureIt() && (
            <Block $style={{ width: "300px", marginTop: "-48px" }}>
              <p style={{ marginBottom: "24px" }}>
                Publish your art to be featured on Picture it community or share with friends
              </p>
              <Block display="flex" flexDirection="column" gridGap="24px">
                <Block>
                  <b>Title</b>
                  <Input
                    autoFocus={true}
                    value={publishTitle || ""}
                    onChange={(e) => setPublishTitle(e.target.value)}
                    size={SIZE.large}
                    overrides={{
                      Input: {
                        style: { width: "300px" },
                      },
                    }}
                  />
                </Block>
                {previewType == "video" && (
                  <VideoControls
                    videoControls={videoControls}
                    setVideoControls={setVideoControls}
                    videoRef={videoRef}
                  />
                )}
                {publishRequest.state == "hasError" && (
                  <Notification
                    kind={KIND.negative}
                    notificationType={"inline"}
                    overrides={{
                      Body: {
                        style: {
                          margin: "24px 0 0 0!important",
                        },
                      },
                    }}
                  >
                    Sorry, an error has occurred, please try again
                  </Notification>
                )}
                <Block>
                  <Button
                    style={{ marginTop: "12px" }}
                    onClick={() => publishTitle && publish({ title: publishTitle, image: image })}
                    disabled={!publishTitle || publishRequest.state == "loading"}
                  >
                    {publishRequest.state == "loading" ? <Spinner /> : "Publish"}
                  </Button>
                </Block>
              </Block>
            </Block>
          )}
        </Block>
      </Block>
    </Block>
  )
}

const Overlay = ({ content, children }: { content: React.ReactNode; children: React.ReactNode }) => {
  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          color: "#FFF",
          gap: "16px",
        }}
      >
        {content}
      </div>
      {children}
    </div>
  )
}

const VideoControls = ({
  videoControls,
  setVideoControls,
  videoRef,
}: {
  videoControls: VideoControls
  setVideoControls: React.Dispatch<React.SetStateAction<VideoControls>>
  videoRef: React.MutableRefObject<HTMLVideoElement | null>
}) => {
  return (
    <Block display="flex" flexDirection="column" gridGap="4px">
      <b>Video Controls</b>
      <Block display="flex" gridGap="8px">
        <StatefulTooltip
          placement={PLACEMENT.top}
          showArrow={true}
          accessibilityType="tooltip"
          content="Loop"
          overrides={{
            Body: {
              style: {
                zIndex: 131,
              },
            },
          }}
        >
          <Button
            kind={BUTTON_KIND.secondary}
            size={BUTTON_SIZE.compact}
            isSelected={videoControls.loop}
            onClick={() => {
              setVideoControls((state) => ({ ...state, loop: !state.loop }))
              videoRef.current?.play()
            }}
          >
            <Loop size={24} fill={videoControls.loop ? "#FFF" : "#000"} />
          </Button>
        </StatefulTooltip>
        <StatefulTooltip
          placement={PLACEMENT.top}
          showArrow={true}
          accessibilityType="tooltip"
          content="Boomerang Effect"
          overrides={{
            Body: {
              style: {
                zIndex: 131,
              },
            },
          }}
        >
          <Button
            kind={BUTTON_KIND.secondary}
            size={BUTTON_SIZE.compact}
            isSelected={videoControls.boomerang}
            onClick={() => setVideoControls((state) => ({ ...state, boomerang: !state.boomerang }))}
          >
            <Boomerang size={24} fill={videoControls.boomerang ? "#FFF" : "#000"} />
          </Button>
        </StatefulTooltip>
        <StatefulPopover
          showArrow={true}
          placement={PLACEMENT.bottom}
          content={() => (
            <Block padding="12px" width="200px" backgroundColor="#ffffff" display="grid" gridGap="8px">
              <Block $style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Block $style={{ fontSize: "14px" }}>Frames per Second</Block>
                <Block width="52px">
                  <Input
                    overrides={{
                      Input: {
                        style: {
                          backgroundColor: "#ffffff",
                          textAlign: "center",
                        },
                      },
                      Root: {
                        style: {
                          borderBottomColor: "rgba(0,0,0,0.15)",
                          borderTopColor: "rgba(0,0,0,0.15)",
                          borderRightColor: "rgba(0,0,0,0.15)",
                          borderLeftColor: "rgba(0,0,0,0.15)",
                          borderTopWidth: "1px",
                          borderBottomWidth: "1px",
                          borderRightWidth: "1px",
                          borderLeftWidth: "1px",
                          height: "26px",
                        },
                      },
                      InputContainer: {},
                    }}
                    size={SIZE.mini}
                    onChange={() => {}}
                    value={Math.round(videoControls.framesPerSecond)}
                  />
                </Block>
              </Block>

              <Block>
                <Slider
                  overrides={{
                    InnerThumb: () => null,
                    ThumbValue: () => null,
                    TickBar: () => null,
                    Track: {
                      style: {
                        paddingRight: 0,
                        paddingLeft: 0,
                      },
                    },
                    Thumb: {
                      style: {
                        height: "12px",
                        width: "12px",
                      },
                    },
                  }}
                  min={2}
                  max={50}
                  marks={false}
                  value={[videoControls.framesPerSecond]}
                  onChange={({ value }) => setVideoControls((state) => ({ ...state, framesPerSecond: value[0] }))}
                />
              </Block>
            </Block>
          )}
          overrides={{
            Body: {
              style: {
                zIndex: 131,
              },
            },
          }}
        >
          <Block display="inline-flex">
            <StatefulTooltip
              placement={PLACEMENT.top}
              showArrow={true}
              accessibilityType="tooltip"
              content="Frames per Second"
              overrides={{
                Body: {
                  style: {
                    zIndex: 131,
                  },
                },
              }}
            >
              <Button kind={BUTTON_KIND.secondary} size={BUTTON_SIZE.compact}>
                <Block width="24px">{videoControls.framesPerSecond}</Block>
              </Button>
            </StatefulTooltip>
          </Block>
        </StatefulPopover>
      </Block>
    </Block>
  )
}

export default Preview

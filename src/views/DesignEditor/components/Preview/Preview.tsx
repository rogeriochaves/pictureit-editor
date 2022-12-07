import { useEditor } from "@layerhub-io/react"
import { Block } from "baseui/block"
import { Button } from "baseui/button"
import { Spinner } from "baseui/icon"
import { Input, SIZE } from "baseui/input"
import { Modal, ModalBody, ROLE, SIZE as MODAL_SIZE } from "baseui/modal"
import { KIND, Notification } from "baseui/notification"
import { useCallback, useEffect, useState } from "react"
import { useRecoilState, useRecoilValue } from "recoil"
import { isPictureIt } from "../../../../api"
import { currentDesignState, publishTitleState } from "../../../../state/designEditor"
import { publishPictureCall } from "../../../../state/publish"
import { useRecoilLazyLoadable } from "../../../../utils/lazySelectorFamily"

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

const PreviewContent = () => {
  const editor = useEditor()
  const [image, setImage] = useState("")
  const [publishTitle, setPublishTitle] = useRecoilState(publishTitleState)
  const currentDesign = useRecoilValue(currentDesignState)
  const [publishRequest, publish] = useRecoilLazyLoadable(publishPictureCall)

  const makePreview = useCallback(async () => {
    if (editor) {
      const template = editor.scene.exportToJSON()
      const image = (await editor.renderer.renderWebp(template)) as string
      setImage(image)
    }
  }, [editor])

  useEffect(() => {
    makePreview()
  }, [editor, makePreview])

  useEffect(() => {
    if (!publishTitle) {
      setPublishTitle(currentDesign.name)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Block $style={{ flex: 1, alignItems: "center", justifyContent: "center", display: "flex", padding: "5rem" }}>
      <Block $style={{ maxWidth: "1200px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <Block $style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          <img width="auto" height="100%" src={image} />
          {isPictureIt() && (
            <Block $style={{ width: "300px", marginTop: "-48px" }}>
              <p style={{ marginBottom: "24px" }}>
                Publish your art to be featured on Picture it community or share with friends
              </p>
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
              <Button
                style={{ marginTop: "12px" }}
                onClick={() => publishTitle && publish({ title: publishTitle, image: image })}
                disabled={!publishTitle || publishRequest.state == "loading"}
              >
                {publishRequest.state == "loading" ? <Spinner /> : "Publish"}
              </Button>
            </Block>
          )}
        </Block>
      </Block>
    </Block>
  )
}

export default Preview

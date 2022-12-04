import { Button, SIZE } from "baseui/button"
import React, { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useRecoilState } from "recoil"
import ResizeObserver from "resize-observer-polyfill"
import Loading from "./components/Loading"
import { editorFonts } from "./constants/fonts"
import { useAutosaveEffect, usePreventCloseIfNotSaved } from "./hooks/useSaveLoad"
import { isMobileState } from "./state/designEditor"
import { loadFileRequest, saveFileRequest } from "./state/file"
import { useRecoilLazyLoadable, useRecoilValueLazyLoadable } from "./utils/lazySelectorFamily"

const Container = ({ children }: { children: React.ReactNode }) => {
  useAutosaveEffect()
  usePreventCloseIfNotSaved()
  const { id } = useParams()
  const [loadRequest, loadFile] = useRecoilLazyLoadable(loadFileRequest)
  const saveRequest = useRecoilValueLazyLoadable(saveFileRequest)
  const navigate = useNavigate()

  const containerRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useRecoilState(isMobileState)
  const [loaded, setLoaded] = useState(false)
  const updateMediaQuery = (value: number) => {
    if (!isMobile && value >= 800) {
      setIsMobile(false)
    } else if (!isMobile && value < 800) {
      setIsMobile(true)
    } else {
      setIsMobile(false)
    }
  }
  useEffect(() => {
    const containerElement = containerRef.current!
    const containerWidth = containerElement.clientWidth
    updateMediaQuery(containerWidth)
    const resizeObserver = new ResizeObserver((entries) => {
      const { width = containerWidth } = (entries[0] && entries[0].contentRect) || {}
      updateMediaQuery(width)
    })
    resizeObserver.observe(containerElement)
    return () => {
      if (containerElement) {
        resizeObserver.unobserve(containerElement)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    loadFonts()
  }, [])

  useEffect(() => {
    if (id && saveRequest.state !== "hasValue") {
      loadFile(id).then(() => {
        setLoaded(true)
      })
    } else {
      setLoaded(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadFonts = () => {
    const promisesList = editorFonts.map((font) => {
      // @ts-ignore
      return new FontFace(font.name, `url(${font.url})`, font.options).load().catch((err) => err)
    })
    Promise.all(promisesList)
      .then((res) => {
        res.forEach((uniqueFont) => {
          if (uniqueFont && uniqueFont.family) {
            document.fonts.add(uniqueFont)
          }
        })
      })
      .catch((err) => console.log({ err }))
  }

  const ErrorLoadingFile = () => (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      {loadRequest.contents.status == "404" ? (
        <>
          <p>File not found</p>
          <Button
            size={SIZE.compact}
            onClick={() => {
              navigate("/editor")
            }}
          >
            Start New Project
          </Button>
        </>
      ) : (
        "Error loading file"
      )}
    </div>
  )

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        display: "flex",
        height: "100vh",
        width: "100vw",
      }}
    >
      {loaded ? <>{children} </> : loadRequest.state == "hasError" ? <ErrorLoadingFile /> : <Loading />}
    </div>
  )
}

export default Container

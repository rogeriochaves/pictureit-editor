import Scrollbars from "@layerhub-io/react-custom-scrollbar"
import React, { CSSProperties } from "react"

export default function Scrollable({ children, autoHide, style }: { children: React.ReactNode; autoHide?: boolean, style?: CSSProperties}) {
  return (
    <div style={{ flex: 1, position: "relative", ...style }}>
      <div style={{ height: "100%", width: "100%", position: "absolute", overflow: "hidden" }}>
        <Scrollbars autoHide={autoHide}>{children}</Scrollbars>
      </div>
    </div>
  )
}

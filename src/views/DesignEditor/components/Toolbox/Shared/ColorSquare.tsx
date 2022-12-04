import { PropsWithChildren } from "react"
import { Block } from "baseui/block"

export function ColorSquare(props: PropsWithChildren) {
  return (
    <Block
      $style={{
        height: "24px",
        width: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        backgroundColor: "#FFF",
        border: "1px solid #dedede",
      }}
      {...props}
    >
      {props.children}
    </Block>
  )
}

import React from "react"
import { styled } from "baseui"
import { Theme } from "baseui/theme"
import Common from "./Common"
import Scenes from "./Scenes"

const Container = styled<"div", object, Theme>("div", ({ $theme }) => ({
  background: $theme.colors.white,
  borderTop: "1px solid #e7e8f3",
}))

const Graphic = () => {
  return (
    <Container>
      <Scenes />
      <Common />
    </Container>
  )
}

export default Graphic

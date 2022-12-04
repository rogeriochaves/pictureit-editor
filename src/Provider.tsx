import { Provider as ScenifyProvider } from "@layerhub-io/react"
import { TimerProvider } from "@layerhub-io/use-timer"
import { BaseProvider, LightTheme } from "baseui"
import i18next from "i18next"
import React from "react"
import { I18nextProvider } from "react-i18next"
import { RecoilRoot } from "recoil"
import { Client as Styletron } from "styletron-engine-atomic"
import { Provider as StyletronProvider } from "styletron-react"
import "./translations"

const engine = new Styletron()

const Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <TimerProvider>
      <RecoilRoot>
        <ScenifyProvider>
          <StyletronProvider value={engine}>
            <BaseProvider theme={LightTheme}>
              <I18nextProvider i18n={i18next}>{children}</I18nextProvider>
            </BaseProvider>
          </StyletronProvider>
        </ScenifyProvider>
      </RecoilRoot>
    </TimerProvider>
  )
}

export default Provider

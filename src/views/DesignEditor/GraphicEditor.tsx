import { Block } from "baseui/block"
import { Button } from "baseui/button"
import { Modal, ModalBody, ModalButton, ModalFooter, ModalHeader, ROLE, SIZE } from "baseui/modal"
import { useRecoilValue, useRecoilValueLoadable, useSetRecoilState } from "recoil"
import GreenCheckmark from "../../components/Icons/GreenCheckmark"
import { paymentRequiredState } from "../../state/generateImage"
import { currentUserQuery } from "../../state/user"
import Canvas from "./components/Canvas"
import EditorContainer from "./components/EditorContainer"
import Footer from "./components/Footer"
import Navbar from "./components/Navbar"
import Panels from "./components/Panels"
import Toolbox from "./components/Toolbox"
import Shortcuts from "./Shortcuts"

const GraphicEditor = () => {
  const user = useRecoilValueLoadable(currentUserQuery)
  const paymentRequired = useRecoilValue(paymentRequiredState)

  return (
    <EditorContainer>
      {user.state == "hasError" && <SignInAgain />}
      {paymentRequired && <PaymentRequired />}
      <Shortcuts />
      <Navbar />
      <div style={{ display: "flex", flex: 1 }}>
        <Panels />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative" }}>
          <Toolbox />
          <Canvas />
          <Footer />
        </div>
      </div>
    </EditorContainer>
  )
}

const PaymentRequired = () => {
  const setPaymentRequired = useSetRecoilState(paymentRequiredState)

  const redirect = () => {
    document.location = `https://pictureit.art/update_subscription`
  }

  return (
    <Modal
      onClose={() => {
        setPaymentRequired(false)
      }}
      closeable
      isOpen={true}
      animate
      autoFocus
      size={SIZE.default}
      role={ROLE.dialog}
      overrides={{
        Root: {
          style: {
            zIndex: 130,
          },
        },
      }}
    >
      <ModalHeader>Subscription Required</ModalHeader>
      <ModalBody>
        Setup your payment method to keep generating images, no worries, it&apos;s super cheap - literally a couple
        cents - and you only pay for what you use
        <Block display="flex" gridGap="8px" marginTop="32px" alignItems="center">
          <GreenCheckmark size={24} />
          Pay per usage, around $0.02 per image*
        </Block>
        <Block display="flex" gridGap="8px" marginTop="16px" alignItems="center">
          <GreenCheckmark size={24} />
          No hidden costs/fees
        </Block>
        <Block display="flex" gridGap="8px" marginTop="16px" alignItems="center">
          <GreenCheckmark size={24} />
          Cancel anytime
        </Block>
      </ModalBody>
      <ModalFooter>
        <Block display="flex" $style={{width: "100%"}} flexDirection="column" gridGap="12px" justifyContent="space-between" alignItems="center">
          <Block $style={{ fontSize: "13px", color: "rgb(100, 100, 100)" }}>* $0.00345 per AI usage second</Block>
          <Button onClick={redirect} style={{ width: "100%", marginBottom: "12px" }}>Setup Payment with Stripe</Button>
        </Block>
      </ModalFooter>
    </Modal>
  )
}

const SignInAgain = () => {
  const redirect = () => {
    document.location = `https://pictureit.art/login?return_to=${encodeURIComponent(document.location.toString())}`
  }

  return (
    <Modal
      onClose={redirect}
      closeable
      isOpen={true}
      animate
      autoFocus
      size={SIZE.default}
      role={ROLE.dialog}
      overrides={{
        Root: {
          style: {
            zIndex: 130,
          },
        },
      }}
    >
      <ModalHeader>Signed Out</ModalHeader>
      <ModalBody>
        You were signed out from Picture it, you will now be redirected to the login page to be able sign in again and
        continue using the editor
      </ModalBody>
      <ModalFooter>
        <ModalButton onClick={redirect}>Okay</ModalButton>
      </ModalFooter>
    </Modal>
  )
}

export default GraphicEditor

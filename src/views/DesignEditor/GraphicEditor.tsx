import { Modal, ModalBody, ModalButton, ModalFooter, ModalHeader, ROLE, SIZE } from "baseui/modal"
import { useRecoilValueLoadable } from "recoil"
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

  return (
    <EditorContainer>
      {user.state == "hasError" && <SignInAgain />}
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

const SignInAgain = () => {
  const redirect = () => {
    document.location = `https://pictureit.art/login?return_to=${encodeURIComponent(document.location.toString())}`
  }

  return (
    <Modal onClose={redirect} closeable isOpen={true} animate autoFocus size={SIZE.default} role={ROLE.dialog}>
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

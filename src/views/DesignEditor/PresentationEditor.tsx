import Navbar from "./components/Navbar"
import Tools from "./components/Tools"
import Canvas from "./components/Canvas"
import Footer from "./components/Footer"
import Toolbox from "./components/Toolbox"
import EditorContainer from "./components/EditorContainer"

const PresentationEditor = () => {
  return (
    <EditorContainer>
      <Navbar />
      <div style={{ display: "flex", flex: 1 }}>
        <Tools />
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Toolbox />
          <Canvas />
          <Footer />
        </div>
      </div>
    </EditorContainer>
  )
}

export default PresentationEditor

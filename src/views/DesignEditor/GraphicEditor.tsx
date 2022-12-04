import Navbar from "./components/Navbar"
import Panels from "./components/Panels"
import Canvas from "./components/Canvas"
import Footer from "./components/Footer"
import EditorContainer from "./components/EditorContainer"
import ContextMenu from "./components/ContextMenu"
import Shortcuts from "./Shortcuts"

const GraphicEditor = () => {
  return (
    <EditorContainer>
      <Shortcuts />
      <Navbar />
      <div style={{ display: "flex", flex: 1 }}>
        <Panels />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative" }}>
          <Canvas />
          <Footer />
        </div>
      </div>
    </EditorContainer>
  )
}

export default GraphicEditor

import { BrowserRouter, Routes, Route } from "react-router-dom"
import DesignEditor from "~/views/DesignEditor"
import Dashboard from "~/views/Dashboard"

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/manage" element={<Dashboard />} />
        <Route path="/" element={<DesignEditor />} />
        <Route path="/editor" element={<DesignEditor />} />
      </Routes>
    </BrowserRouter>
  )
}

export default Router

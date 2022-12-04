import ReactDOM from "react-dom/client"
import Provider from "./Provider"
import Router from "./Router"
import "./styles/styles.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider>
    <Router />
  </Provider>
)

import express, { Request } from "express"
import path from "path"
import cors from "cors"
import proxy from "express-http-proxy"
import bodyParser from "body-parser"

const app = express()

app.use(cors())
app.use(bodyParser.json({ limit: "10mb" }))
app.use("/", express.static(path.join(__dirname, "public")))

app.use(
  proxy((req: Request) => {
    const host = req.header("x-host")
    if (!host) {
      throw "X-Host header was not set, don't know where to proxy this request!"
    }
    return host
  })
)

const { PORT = 5174 } = process.env
app.listen(PORT, () => {
  console.log()
  console.log(`  Proxy server started`)
  console.log()
})

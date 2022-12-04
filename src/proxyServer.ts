import express, { Request } from "express"
import path from "path"
import cors from "cors"
import proxy from "express-http-proxy"
import bodyParser from "body-parser"

const app = express()

app.use(cors({ origin: true, credentials: true }))
app.use(bodyParser.json({ limit: "10mb" }))
app.use("/", express.static(path.join(__dirname, "public")))

app.use((req, res, next) => {
  // https://github.com/villadora/express-http-proxy/issues/359
  const opts = req.method == "GET" ? { parseReqBody: false } : undefined

  return proxy((req: Request) => {
    const host = req.header("x-host")
    if (!host) {
      throw "X-Host header was not set, don't know where to proxy this request!"
    }
    return host
  }, opts)(req, res, next)
})

const { PORT = "5174" } = process.env
app.listen(parseInt(PORT), "0.0.0.0", () => {
  console.log()
  console.log(`  Proxy server started`)
  console.log()
})

import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import express from "express";
import wisp from "wisp-server-node";
import { scramjetPath } from "@mercuryworkshop/scramjet/path";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";
import * as libcurl from "@mercuryworkshop/libcurl-transport";
import * as epoxy from "@mercuryworkshop/epoxy-transport";

const app = express();
app.use(express.static(fileURLToPath(new URL("./public", import.meta.url))));
app.use("/scram/", express.static(scramjetPath));
app.use("/baremux/", express.static(baremuxPath));
if (libcurl.libcurlPath) app.use("/libcurl/", express.static(libcurl.libcurlPath));
if (epoxy.epoxyPath) app.use("/epoxy/", express.static(epoxy.epoxyPath));
app.use((req, res) => res.status(404).send("Not found"));

const server = createServer(app);
server.on("upgrade", (req, socket, head) => {
  if (req.url.endsWith("/wisp/")) wisp.routeRequest(req, socket, head);
  else socket.end();
});

const port = parseInt(process.env.PORT || "") || 8080;
server.listen(port, "0.0.0.0", () => {
  console.log(`Portal running on port ${port}`);
  console.log(`transports: libcurl=${!!libcurl.libcurlPath} epoxy=${!!epoxy.epoxyPath}`);
});

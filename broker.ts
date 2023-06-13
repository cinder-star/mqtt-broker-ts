import { createBroker } from "aedes";
import * as Http from "http";
import * as WebSocket from "ws";
import dotenv from "dotenv";

dotenv.config();
const port = process.env.PORT || 8080;

const httpServer = Http.createServer();
const aedes = createBroker();

// Creating a websocket server using http server
const wss = new WebSocket.Server({ server: httpServer });

// When a client connects through websocket, bind mqtt handler
wss.on("connection", (ws) => {
  const duplex = WebSocket.createWebSocketStream(ws);
  aedes.handle(duplex);
});

// Start thhe http server
httpServer.listen(port, () => {
  console.log("System: Server started on port:", port);
});

// Handle aedes client error
aedes.on("clientError", (client, err) => {
  console.log(
    `Aedes: client error: (clientId: ${client.id}, message: ${err.message}, stack: ${err.stack})`
  );
});

// Handle aedes connection error
aedes.on("connectionError", (client, err) => {
  console.log(
    `Aedes: connection error: (clientId: ${client.id}, message: ${err.message}, stack: ${err.stack})`
  );
});

// Aedes publish packet callback
aedes.on("publish", (packet, client) => {
  const packetOwner = client ? "Client" : "Aedes";
  if (packet && packet.payload) {
    console.log(`${packetOwner}: publish packet: ${packet.payload.toString()}`);
  }
});

// Aedes subscription callback
aedes.on("subscribe", (subscriptions, client) => {
  if (client) {
    console.log(
      `Aedes: subscription from client: (subscrioptions: ${JSON.stringify(
        subscriptions
      )}, clientId: ${client.id})`
    );
  }
});

// Aedes unsubscription callback
aedes.on("unsubscribe", (unsubscriptions, client) => {
  if (client) {
    console.log(
      `Aedes: unsubscription from client: (unsubscrioptions: ${JSON.stringify(
        unsubscriptions
      )}, clientId: ${client.id})`
    );
  }
});

// Aedes new client connection
aedes.on("clientReady", (client) => {
  console.log(`Aedes: new client: (clientId: ${client.id})`);
});

// Aedes client disconnect callback
aedes.on("clientDisconnect", (client) => {
  console.log(`Aedes: client disconnected: (clientId: ${client.id})`);
});

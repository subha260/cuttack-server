const mqtt = require("mqtt")
const WebSocket = require("ws")
const express = require("express")
const cors = require("cors")
const calibration = require("./config/calibration")
const app = express()

app.use(cors())

const server = app.listen(5000, () => {
  console.log("Server Running On Port 5000")
})

/* WebSocket Server */

const wss = new WebSocket.Server({ server })


/* MQTT Connection */

const mqttClient = mqtt.connect("mqtt://122.176.25.98:1883")

mqttClient.on("connect", () => {

  console.log("MQTT Connected")

  mqttClient.subscribe("MSG21/PERIODIC")
  //mqttClient.subscribe("zone02/data")

})

/* MQTT Message */

mqttClient.on("message", (topic, message) => {

  try{
    
    
    const raw = JSON.parse(message.toString())

    /* Total Outlet Flow */
const zoneCal = calibration[raw.ID] || {

    esrDiv:1,

    inletFlowDiv:1,

    outletFlowDiv:1,

    inletTotaliserDiv:1,

    outletTotaliserDiv:1,

    chlorineDiv:1

}
    const totalOutletFlow = raw.mf1
    /* Final Frontend Data */

const data = {

  name: raw.ID,

  esr: Number(
    (raw.l1 / zoneCal.esrDiv).toFixed(2)
  ),

  inletFlow: Number(
    (raw.f1 / zoneCal.inletFlowDiv).toFixed(1)
  ),

  outletFlow: Number(
    (raw.mf1 / zoneCal.outletFlowDiv).toFixed(1)
  ),

  inletTotaliser: Number(
    (raw.ft1 / zoneCal.inletTotaliserDiv).toFixed(1)
  ),

  outletTotaliser: Number(
    (raw.mft1 / zoneCal.outletTotaliserDiv).toFixed(1)
  ),

  chlorine: Number(
    (raw.c11 / zoneCal.chlorineDiv).toFixed(2)
  )

}

    console.log(data)

    /* Send To React */

    wss.clients.forEach(client => {

      if(client.readyState === WebSocket.OPEN){

        client.send(JSON.stringify(data))

      }

    })

  }

  catch(err){

    console.log(err)

  }

})
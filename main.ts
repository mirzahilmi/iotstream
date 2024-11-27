import mqtt from "mqtt";
import promclient from "prom-client";
// @deno-types="npm:@types/express@^5.0.0"
import express from "express";
import { Buffer } from "node:buffer";

const client = mqtt.connect(`mqtt:${Deno.env.get("MQTT_HOST")}`, {
    username: Deno.env.get("MQTT_USERNAME"),
    password: Deno.env.get("MQTT_PASSWORD"),
    port: Number(Deno.env.get("MQTT_PASSWORD")),
    connectTimeout: 10 * 1000,
});
console.log("Connecting...");
client.on("connect", () => {
    client.subscribe([
        "icnss/temperature",
        "icnss/humidity",
        "icnss/co",
    ]);
    console.log("Connected!");
});
client.on("reconnect", () => {
    console.log("Reconnecting...");
});
client.on("error", () => {
    console.log("Connection failed, exiting...");
    client.end();
    Deno.exit();
});

const tempGauge = new promclient.Gauge({
    name: "temperature",
    help: "Temperature Gauge",
});
const humidGauge = new promclient.Gauge({
    name: "humidity",
    help: "Humidity Gauge",
});
const carbonGauge = new promclient.Gauge({
    name: "co",
    help: "Co Gauge",
});

const tempHandler = (message: Buffer) => {
    const temp = Number(message.toString());
    tempGauge.set(temp);
};
const humidHandler = (message: Buffer) => {
    const humid = Number(message.toString());
    humidGauge.set(humid);
};
const carbonHandler = (message: Buffer) => {
    const carbon = Number(message.toString());
    carbonGauge.set(carbon);
};

client.on("message", (topic, message, _) => {
    console.log(`Message received: ${topic}: ${message.toString()}`);
    switch (topic) {
        case "icnss/temperature":
            tempHandler(message);
            break;
        case "icnss/humidity":
            humidHandler(message);
            break;
        case "icnss/co":
            carbonHandler(message);
            break;
    }
});

const app = express();
app.get("/metrics", async (_, res) => {
    res.status(200).json(await promclient.register.getMetricsAsJSON());
});
app.listen(3000);

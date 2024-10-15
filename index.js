const express = require("express");
const mongoose = require("mongoose");
const app = express();
const jwt = require("jsonwebtoken");
const amqplib = require("amqplib");
const rabbitMQ = "amqp://root:root123@localhost:5672";
const isAuthed = require("../common/auth-middleware");
const Order = require("../order-service/models/Order");
const connect = async () => {
  await mongoose.connect("mongodb://127.0.0.1:27017/Order-serivce");
  console.log("Mongoose Connection Success");
};

app.use(express.json());

let connection;
let channel;

const createOrder = (item, userEmail) => {
  const { products } = item;
  totalPrice = 0;
  products.forEach((element) => {
    totalPrice += element.price;
  });
  const order = new Order({
    products,
    user: userEmail,
    total_price: totalPrice,
  });

  order.save();
  return order;
};

async function connectQueue(params) {
  connection = await amqplib.connect(rabbitMQ);
  channel = await connection.createChannel();
  await channel.assertQueue("ORDER");
}
connectQueue().then(() => {
  channel.consume("ORDER", (data) => {
    const content = JSON.parse(data.content);
    const newOrder = createOrder(content, content.userEmail);
    channel.ack(data);
    channel.sendToQueue("PRODUCT", Buffer.from(JSON.stringify({ newOrder })));
  });
});
connect();
app.listen(7700, () => {
  console.log("Order serivice is running on port 7700");
});

require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require("mongodb");

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.klzscqy.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  const serviceCollection = client.db("Assignment-11").collection("services");
  app.get("/home-services", async (req, res) => {
    const query = {};
    const cursor = serviceCollection.find(query);
    const services = await cursor.limit(3).toArray();
    res.send(services);
  });

  app.get("/services", async (req, res) => {
    const query = {};
    const cursor = serviceCollection.find(query);
    const services = await cursor.toArray();
    res.send(services);
  });
}
run().catch((error) => console.error(error));

// client.connect((err) => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });

app.get("/", (req, res) => {
  res.send("this is the server and it is running. Alhamdulillah");
});

app.listen(port, () => {
  client.connect((err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("mongodb is running");
    }
    // perform actions on the collection object
  });

  console.log("server is running on port", port);
});

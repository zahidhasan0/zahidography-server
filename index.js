require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

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

  const reviewCollection = client.db("Assignment-11").collection("reviews");

  app.post("/reviews", async (req, res) => {
    const review = req.body;
    const result = await reviewCollection.insertOne(review);
    console.log(result);
    res.send(result);
  });

  app.get("/reviewsByUID/:uid", async (req, res) => {
    // const email = req.body;
    // console.log(email);
    const query = req.params.uid;
    const cursor = reviewCollection.find(
      { userUid: { $in: [query] } },
      { _id: 0 }
    );
    const reviews = await cursor.toArray();
    // console.log(reviews);
    res.send(reviews);
  });

  app.get("/reviewsByID/:id", async (req, res) => {
    const ID = req.params.id;
    const cursor = reviewCollection.find(
      { serviceId: { $in: [ID] } },
      { _id: 0 }
    );
    const reviews = await cursor.toArray();
    console.log(reviews);
    res.send(reviews);
  });

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

  app.get("/services/:id", async (req, res) => {
    const id = req.params.id;
    console.log(id);
    const query = { _id: ObjectId(id) };
    const service = await serviceCollection.findOne(query);
    res.send(service);
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

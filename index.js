require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.klzscqy.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// middleware
function verifyToken(req, res, next) {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authorization.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      res.status(403).send({ message: "invalid user" });
    }
    req.decoded = decoded;
    next();
  });
}

// run function
async function run() {
  const serviceCollection = client.db("Assignment-11").collection("services");

  const reviewCollection = client.db("Assignment-11").collection("reviews");
  const photosCollection = client.db("Assignment-11").collection("photos");

  app.post("/jwt", async (req, res) => {
    const user = req.body;
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1d",
    });
    console.log(token);
    res.send({ token });
  });

  //   add review
  app.post("/reviews", async (req, res) => {
    const review = req.body;
    const result = await reviewCollection.insertOne(review);
    // console.log(result);
    res.send(result);
  });

  //   add service
  app.post("/services", async (req, res) => {
    const service = req.body;
    const result = await serviceCollection.insertOne(service);
    console.log(result);
    res.send(result);
  });

  //   get Photos
  app.get("/photos", async (req, res) => {
    const query = {};
    const cursor = photosCollection.find(query);
    const photos = await cursor.toArray();
    // console.log(photos);
    res.send(photos);
  });

  //   get reviews with uid
  app.get("/reviewsByUID/:uid", verifyToken, async (req, res) => {
    const decoded = req.decoded;
    console.log(decoded);
    const email = req.headers.email;
    console.log(email);
    if (decoded.email !== email) {
      return res.status(403).send({ message: "Forbiden to access" });
    }
    const query = req.params.uid;
    const cursor = reviewCollection.find(
      { userUid: { $in: [query] } },
      { _id: 0 }
    );
    const reviews = await cursor.toArray();
    console.log(reviews);
    res.send(reviews);
  });

  //   filter review by id

  app.get("/reviewsByID/:id", async (req, res) => {
    const ID = req.params.id;
    const cursor = reviewCollection.find(
      { serviceId: { $in: [ID] } },
      { _id: 0 }
    );
    const reviews = await cursor.toArray();
    // console.log(reviews);
    res.send(reviews);
  });

  //   get home page services
  app.get("/home-services", async (req, res) => {
    const query = {};
    const cursor = serviceCollection.find(query);
    const services = await cursor.limit(3).toArray();
    res.send(services);
  });

  //   get all services
  app.get("/services", async (req, res) => {
    const query = {};
    const cursor = serviceCollection.find(query);
    const services = await cursor.toArray();
    res.send(services);
  });

  //   get single service

  app.get("/services/:id", async (req, res) => {
    const id = req.params.id;
    // console.log(id);
    const query = { _id: ObjectId(id) };
    const service = await serviceCollection.findOne(query);
    res.send(service);
  });

  //   get single review

  app.get("/reviews/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const review = await reviewCollection.findOne(query);
    // console.log(review);
    res.send(review);
  });

  app.put("/reviews/:id", async (req, res) => {
    const id = req.params.id;
    const body = req.body.text;
    const query = { _id: ObjectId(id) };
    const updatedReview = {
      $set: {
        revirewText: body,
      },
    };

    const result = await reviewCollection.updateOne(query, updatedReview);

    res.send(result);
  });

  app.delete("/reviews/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await reviewCollection.deleteOne(query);

    res.send(result);
  });
}
run().catch((error) => console.error(error));

// testing api
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

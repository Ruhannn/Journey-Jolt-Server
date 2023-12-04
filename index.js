const jwt = require('jsonwebtoken');
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());

app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.llm45p4.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const packageCollection = client.db("JourneyJolt").collection("packages");
    const userCollection = client.db("JourneyJolt").collection("users");
    const wishlistCollection = client.db("JourneyJolt").collection("wishlist");
    const storiesCollection = client.db("JourneyJolt").collection("stories");
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
        expiresIn: "3h",
      });
      res.send({ token });
    });
    app.get("/packages", async (req, res) => {
      // const email = req.query.email;
      // if (email) {
      //   const query = { providerEmail: email };
      //   const result = await serviceCollection.find(query).toArray();
      //   res.send(result);
      // }
      // else {
      //   const result = await serviceCollection.find().toArray();
      //   res.send(result);
      // }
      const result = await packageCollection.find().toArray();
      res.send(result);
    });
    app.get("/stories", async (req, res) => {
      const result = await storiesCollection.find().toArray();
      res.send(result);
    });
    app.get("/user", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });
    app.get("/user/:email", async (req, res) => {
      const userEmail = req.query.email;
      const result = await userCollection.findOne({ email: userEmail });
      res.send(result);
    });

    // app.put("/user/:email", async (req, res) => {
    //   const email = req.params.email;
    //   const photo = req.body.photo;
    //   const name = req.body.name;
    //   const userinfo = {
    //     name,
    //     photo,
    //     email,
    //     role: "user",
    //     timeCreated: new Date().toLocaleString(),
    //   };
    //   console.log("userinfo", userinfo);

    //   const result = await userCollection.insertOne(userinfo);
    //   res.send(result);
    // });
    app.post("/user/:email", async (req, res) => {
      const user = req.body;
      console.log(user);
      const email = req.params.email;
      const exitingUSer = await userCollection.findOne({ email: email });
      if (exitingUSer) {
        res.send({ message: "already exist", status: null });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });
    app.post("/add-package", async (req, res) => {
      const formData = req.body;
      const result = await packageCollection.insertOne(formData);
      res.send(result);
    });
    app.get("/package/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await packageCollection.findOne(query);
      res.send(result);
    });
    app.post("/wishlist", async (req, res) => {
      const wishlistItem = req.body;
      const result = await wishlistCollection.insertOne(wishlistItem);
      res.status(200).json({
        message: "Item added to the wishlist successfully.",
        result,
      });
    });

    app.get("/wishlist", async (req, res) => {
      const email = req.query.email;
      if (email) {
        const query = { userEmail: email };
        const result = await wishlistCollection.find(query).toArray();
        res.send(result);
      } else {
        const result = await wishlistCollection.find().toArray();
        res.send(result);
      }
    });
    app.get("/packages/:type", async (req, res) => {
      const { type } = req.params;
      try {
        const result = await packageCollection
          .find({ tourType: type })
          .toArray();
        res.json(result);
      } catch (error) {
        console.error("Error fetching packages:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    });
    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      const result = { admin: user?.role === "admin" };
      res.send(result);
    });
    app.get("/users/guide/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      const result = { guide: user?.role === "guide" };
      res.send(result);
    });
    app.get("/users/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = await userCollection.findOne({ email: email });
      let isUser = false;
      if (user) {
        isUser = user?.role === "user";
        res.send(isUser);
      } else {
        res.send(isUser);
      }
    });
    app.patch("/users/admin/:id", async (req, res) => {
      const id = req.params;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    app.patch("/users/guide/:id", async (req, res) => {
      const id = req.params;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: "Guide",
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    // app.post("/booking-service", async (req, res) => {
    //   const bookingData = req.body;
    //   try {
    //     const result = await bookingCollection.insertOne(bookingData);
    //     res.send(result.ops);
    //   } catch (error) {
    //     console.error("Error inserting data:", error);
    //   }
    // });
    // app.patch("/booking-service-update/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const filter = { _id: new ObjectId(id) };
    //   const updateData = req.body;
    //   const result = await bookingCollection.updateOne(filter, {
    //     $set: updateData,
    //   });
    //   res.send(result);
    // });
    // app.put("/update-service/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const filter = { _id: new ObjectId(id) };
    //   const updateData = req.body;
    //   const result = await serviceCollection.updateOne(filter, {
    //     $set: updateData,
    //   });
    //   res.send(result);
    // });
    // app.delete("/service/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: new ObjectId(id) };
    //   const result = await serviceCollection.deleteOne(query);
    //   res.send(result);
    // });
    // app.get("/booked-service", async (req, res) => {
    //   const email = req.query.email;
    //   if (email) {
    //     const query = {
    //       userEmail: email,
    //     };
    //     const result = await bookingCollection.find(query).toArray();
    //     res.send(result);
    //   } else {
    //     const result = await bookingCollection.find().toArray();
    //     res.send(result);
    //   }
    // });
    // app.get("/pending-service", async (req, res) => {
    //   const email = req.query.email;
    //   if (email) {
    //     const query = {
    //       providerEmail: email,
    //     };
    //     const result = await bookingCollection.find(query).toArray();
    //     res.send(result);
    //   } else {
    //     const result = await bookingCollection.find().toArray();
    //     res.send(result);
    //   }
    // });
    console.log("You successfully connected to MongoDB!");
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("I love Ayaka");
});

app.listen(port, () => {
  console.log(`Love Ayaka on ${port}`);
});

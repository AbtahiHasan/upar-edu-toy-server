require("dotenv").config()
const express = require("express")
const cors = require("cors")
const port = process.env.PORT || 3000
const app = express()

app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = process.env.DB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {


    const database = client.db("upar_edu_toy")
    const toys_collection = database.collection("toys")
    const cart_collection = database.collection("carts")
    

    const indexKey = {name: 1}
    const indexOption = {name: "toy_name"}
    await toys_collection.createIndex(indexKey, indexOption)

    app.get("/toys", async(req, res) => {
        const toys = toys_collection.find().limit(20)
        const result = await toys.toArray()
        res.send(result)
    })
    app.get("/sort", async (req, res) => {
      let sort_type = {};
        if (req.query?.sortby) {
          sort_type = { sort_by : req.query.sortby }
        }
        let query = {};
        if (req.query?.email) {
            query = { seller_email : req.query.email }
        }

      const asc_des = sort_type.sort_by === "ascending" ? 1 : -1
      const toys = toys_collection.find(query, {sort: {price: asc_des}})
      const result = await toys.toArray()
      res.send(result)

    })
    app.get("/top-toys", async(req, res) => {
      const toys = toys_collection.find({}, {sort: {rating: -1}}).limit(6)
      const result = await toys.toArray()
      res.send(result)
  })

    app.get("/toy/:id", async(req, res) => {
        const id = req.params.id 
        const toy = await toys_collection.findOne({_id: new ObjectId(id)})
        res.send(toy)
    })

    app.get('/seller', async (req, res) => {
        let query = {};
        if (req.query?.email) {
            query = { seller_email : req.query.email }
        }
        const result = await toys_collection.find(query).toArray();
        res.send(result);
    })
    app.get("/search", async(req, res) => {
      const searchQuery = req.query?.query
      const result = await toys_collection.find({name: {$regex: searchQuery, $options: "i"}}).toArray()
      res.send(result)

    })
    app.get("/sub-category", async (req, res) => {
      const subCategoryName = req.query?.category
      const subCategories = await toys_collection.find({sub_category: subCategoryName}).toArray()
      const result = {
        category_name: subCategoryName,
        subCategories
      }

      res.send(result)
    })
    app.post("/add-toy", async (req, res) => {
      const data = req.body
      const toy = {
        photo_url: data.photo_url,
        name: data.name,
        seller_name: data.seller_name,
        seller_email: data.seller_email,
        sub_category: data.sub_category,
        price: data.price,
        rating: data.rating,
        quantity: data.quantity,
        description: data.description
      }
      console.log(toy)
      const result = await toys_collection.insertOne(toy)
      res.send(result)
  })
  app.get("/carts", async (req, res) => {
    const email = req?.query?.email 
    const result = await cart_collection.find({email: email}).toArray()
    res.send(result)
  })
  app.post("/add-to-carts", async (req, res) => {

  })
  app.put("/update/:id", async (req, res) => {
    const id = req.params.id
    const data = req.body
    const result = await toys_collection.updateOne({_id: new ObjectId(id)}, {
        $set: {
          photo_url: data.photo_url,
          name: data.name,
          seller_name: data.seller_name,
          seller_email: data.seller_email,
          sub_category: data.sub_category,
          price: data.price,
          rating: data.rating,
          quantity: data.quantity,
          description: data.description
        }},
        {
            upsert: true
        }
    )
    res.send(result)
})


    app.delete("/delete/:id", async (req, res) => {
        const id = req.params.id
        const result = await toys_collection.deleteOne({_id: new ObjectId(id)})
        res.send(result)
    })

    
  } catch(error) {
    console.log(error)
  }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`this server running at ${port}`)
})
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
    client.connect();
    client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!")

    const database = client.db("upar_edu_toy")
    const toys_collection = database.collection("toys")
    
    app.get("/toys", async(req, res) => {
        const toys = toys_collection.find()
        const result = await toys.toArray()
        res.send(result)
    })
   

    app.get("/toy/:id", async(req, res) => {
        const id = req.params.id 
        const toy = await toys_collection.findOne({_id: new ObjectId(id)})
        res.send(toy)
    })

    app.get('/seller', async (req, res) => {
        console.log(req.query.email);
        let query = {};
        if (req.query?.email) {
            query = { seller_email : req.query.email }
        }
        const result = await toys_collection.find(query).toArray();
        res.send(result);
    })


    app.delete("/delete/:id", (req, res) => {
        const id = req.params.id
        const result = toys_collection.deleteOne({_id: new ObjectId(id)})
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
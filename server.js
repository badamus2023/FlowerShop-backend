import fs from 'node:fs/promises'
import express from "express";
import bodyParser from "body-parser";
import dotenv from 'dotenv';
import { dirname, path } from 'path';
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

dotenv.config()

const PORT = process.env.PORT

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With,content-type'
  );
  next();
});



app.get('/flowers', async (req, res) => {
    const flowersContent = await fs.readFile('./data/flowers.json');
    let flowers = JSON.parse(flowersContent);
    
    res.json({
      flowers: flowers.map((flower) => ({
        id: flower.id,
        name: flower.name,
        description: flower.description,
        image: flower.image,
        price: flower.price,
      })),
    });
});

app.get("/orders", async (req, res) => {
    const ordersContent = await fs.readFile('./data/orders.json');
    let orders = JSON.parse(ordersContent);

    res.json({
      orders: orders.map((order) => ({
        id: order.id,
        userName: order.orderLocation.userName,
        userStreet: order.orderLocation.userStreet,
        userPostal: order.orderLocation.userPostal,
        userCity: order.orderLocation.userCity,
        orderItems: order.orderItems,
      })),
    });
});


app.post('/flowers', async (req, res) => {

    const { flower } = req.body;

    if(!flower) {
      return res.status(400).json({message: 'flower is required.'})
    }

    if(
      !flower.name?.trim() ||
      !flower.description?.trim() ||
      !flower.price?.trim() ||
      !flower.image?.trim()
    ) {
      return res.status(400).json({message: 'Invalid data provided.'})
    }

    const flowersContent = await fs.readFile('./data/flowers.json');
    const flowers = JSON.parse(flowersContent);
    const newId = flowers.length + 1;

    const newFlower = {
        id: newId,
        ...flower,
    };

    flowers.push(newFlower);

    await fs.writeFile('./data/flowers.json', JSON.stringify(flowers));

    res.json({flower: newFlower});

    console.log("new flower added")
})



app.post("/orders", async (req, res) => {
  
  const { orderLocation, orderItems } = req.body;

  if(!orderLocation || !orderItems) {
    return res.status(400).json({message: 'orderLocation and orderItems required.'})
  }

  if (
    !orderLocation.userName?.trim() ||
    !orderLocation.userStreet?.trim() ||
    !orderLocation.userPostal?.trim() ||
    !orderLocation.userCity?.trim()
  ) {
    return res.status(400).json({message: 'Invalid data provided.'})
  }

  const ordersContent = await fs.readFile("./data/orders.json");
  const orders = JSON.parse(ordersContent);
  const newId = orders.length + 1;

 

  const newOrder = {
    id: newId,
    orderLocation: {
      ...orderLocation,
    },
    orderItems: {
      ...orderItems
    },
  };

  orders.push(newOrder);

  await fs.writeFile("./data/orders.json", JSON.stringify(orders));

  res.json({order: newOrder});

  console.log("new order created")
});

app.delete('/flowers/:id', async (req, res) => {
    const flowersContent = await fs.readFile('./data/flowers.json');
    const flowers = JSON.parse(flowersContent);

    const id = parseInt(req.params.id);
    const index = flowers.findIndex((flower) => flower.id === id);

    if(index === -1) return res.status(404).json({message: "Flower not found"});

    flowers.splice(index, 1);

    await fs.writeFile('./data/flowers.json', JSON.stringify(flowers));

    res.json({message: 'Flower deleted'});
    console.log('flower deleted');

})

app.put('/flowers/:id', async (req, res) => {
  const {flower} = req.body;

  if(
    !flower.name?.trim() ||
    !flower.description?.trim() ||
    !flower.price?.trim() ||
    !flower.image?.trim()
  ) {
    return res.status(400).json({message: 'Invalid data provided.'})
  }

  const id = parseInt(req.params.id);
  const flowersContent = await fs.readFile('./data/flowers.json');
  const flowers = JSON.parse(flowersContent);
  const index = flowers.findIndex((flower) => flower.id === id);

  if(index === -1) {
    return res.status(400).json({message: 'flower not found'});
  }

  flowers[index] = {
    id,
    ...flower,
  };

  await fs.writeFile('./data/flowers.json', JSON.stringify(flowers));

  res.json({flower: flowers[index]});
})


app.listen(PORT, () => {
    console.log('server is running on port 3000')
})
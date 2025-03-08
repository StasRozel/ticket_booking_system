const express = require('express');
import { AppDataSource } from './src/config/db.spec';
const bodyParser = require('body-parser');
require('dotenv').config();
import { routeRepository } from './src/routes/repository/repository';

const app = express();

app.use(bodyParser.json());

app.get('/', async (req, res) =>{
    console.log('Aboba');
    const route = {
        name: "aboba",
        price: 123,
        distance: 1234,
        starting_point: "boba",
        ending_point: "biba",
        stops: "b, a, b i",
      };

    console.log(await routeRepository.findAll());
    res.end('Hello World');
})

app.post("/create", async (req, res) => {
    const route = req.body.route;
  
    const { name, price, distance, starting_point, ending_point, stops } = route;
  
    if (!name || !price || !distance || !starting_point || !ending_point || !stops) {
      return res.status(400).json({ error: "Missing required fields in route object" });
    }
  
    console.log("Received route:", route);
    await routeRepository.create(route);

    res.status(200).json({ message: "Route received successfully" });
  });

AppDataSource.initialize()
    .then(() => {
        console.log("Database initialise successfully")
    })
    .catch((error) => console.log(error))

app.listen(3000, () => {
    console.log("Server running in http://localhost:3000");
});
// THESE ARE ONLY TO BE RUN WHEN THE BOT IS ONLINE..

import { collections } from "../modules/mongo";

collections.products.insertMany([{
    id: 'aisud98weuf9',
    name: "Product 1",
    description: "Description 1",
    price: 10,
    stock: 1,
    values: ['aosuioadj']
},{
    id: 'aisud98weuf9q',
    name: "Product 2",
    description: "Description 2",
    price: 100,
    stock: 2,
    values: ['sada']
},{
    id: 'aisud98weuf9sa',
    name: "Product 3",
    description: "Description 3",
    price: 1231,
    stock: 4,
    values: ['aosuioadj']
},{
    id: 'aisud98weuf9s',
    name: "Product 4",
    description: "Description 4",
    price: 120,
    stock: 0,
    values: []
}])
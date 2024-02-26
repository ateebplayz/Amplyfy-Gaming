"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.collections = exports.mongoClient = void 0;
const mongodb_1 = require("mongodb");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.mongoClient = new mongodb_1.MongoClient(process.env.MONGOURI || '');
const db = exports.mongoClient.db('Amplyfy');
exports.collections = {
    users: db.collection('Users'),
    products: db.collection('Products'),
    clans: db.collection('Clans'),
    web: db.collection('WebUser'),
};

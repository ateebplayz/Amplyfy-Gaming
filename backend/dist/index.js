"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const webUser_1 = __importDefault(require("./routes/webUser"));
const mongo_1 = require("./modules/mongo");
mongo_1.mongoClient.connect().then(() => console.log('Connected to MongoDB')).catch(console.error);
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use('/api/web', webUser_1.default);
app.listen(8080, () => {
    console.log('App Listening on Port 8080');
});

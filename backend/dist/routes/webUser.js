"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_1 = __importDefault(require("express"));
const mongo_1 = require("../modules/mongo");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const router = express_1.default.Router();
router.use('/get', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.query.username;
    const password = req.query.password;
    if (!username || !password) {
        return res.json({ error: `Invalid Username Or Password`, code: 401 });
    }
    else {
        const userDoc = yield mongo_1.collections.web.findOne({ username: username });
        if (userDoc) {
            if (userDoc.password == password) {
                const userToken = jsonwebtoken_1.default.sign(userDoc, process.env.JWTKEY || 'X');
                return res.json({ token: userToken, code: 200 });
            }
            else {
                return res.json({ error: `Incorrect Password`, code: 402 });
            }
        }
        else {
            return res.json({ error: `Username not found`, code: 404 });
        }
    }
}));
exports.default = router;

import * as chai from 'chai';
import * as express from "express";
import { MongoClient, Collection, Db, MongoClientOptions, Long } from 'mongodb';
import chaiHttp = require('chai-http');

import Server from "../../server";
import { ConfigTest } from '../../config';

let db: Db;
let counters: Collection;
let clients: Collection;
let tokens: Collection;
let users: Collection;

chai.use(chaiHttp);

const app = express();
const router = express.Router();
const appServer = new Server(app, router);

describe('User API', function () {
    before(async () => {
        let mongo: MongoClient = await MongoClient.connect(ConfigTest.MongoUri, ConfigTest.MongoConfig as MongoClientOptions);
        db = mongo.db(ConfigTest.MongoDatabase);

        await appServer.run();

        counters = db.collection('counters');
        clients = db.collection('clients');
        tokens = db.collection('tokens');
        users = db.collection('users');

        await clients.insertOne({
            "id": "web",
            "nam": "Website",
            "scr": "160c96fbe9d44794868de4ce617744da",
            "grts": [ 
                "password", 
                "refresh_token"
            ]
        });
    });

    beforeEach(async () => {
        await counters.deleteMany({});
        await users.deleteMany({});
        await tokens.deleteMany({});
    });

    after(async () => {
        await clients.deleteMany({});
    });

    describe('POST /signup', () => {
        it('should return success when user was created', async () => {            
            let result = await chai.request(appServer.app)
                .post('/signup')
                .set('Content-Type', 'application/json')
                .send({
                    username: 'holydog',
                    password: 'whitedog',
                    name: 'Chanon Trising',
                });
            let user = await users.findOne({ id: 1 });

            chai.expect(result.body.success).to.equal(true);

            chai.expect(user).to.be.not.null;
            chai.expect(user).to.have.property('id', 1);
            chai.expect(user).to.have.property('un', 'holydog');
            chai.expect(user).to.have.property('nam', 'Chanon Trising');
        });
        it('should return error when username already exists', async () => {  
            await users.insertOne({
                id: Long.fromNumber(1),
                un: "holydog",
                nam: 'Chanon Trising'
            });         
            
            let result = await chai.request(appServer.app)
                .post('/signup')
                .set('Content-Type', 'application/json')
                .send({
                    username: 'holydog',
                    password: 'whitedog',
                    name: 'Prapatsorn Apiwannarat',
                });

            chai.expect(result.body.error).to.eql({
                message: 'ชื่อผู้ใช้งานนี้ถูกใช้งานแล้ว'
            });
        });
    });

    describe('GET /me', () => {
        it('should return unauthorized error when token invalid', async () => {
            let result = await chai.request(appServer.app)
                .get('/me')
                .send();
            
            chai.expect(result.body.error).to.eql({
                code: 101, 
                message: 'unauthorized'
            });
        });
        it('should return user information when token valid', async () => {            
            await tokens.insertOne({
                "at": "ccdc7ebd4921b3ef8a382b2d3bcee0b21a27558d",
                "ate": new Date("2030-05-19T13:58:09.996+07:00"),
                "rt": "9cec135512eb88c633388d4db1831c0e099732b4",
                "rte": new Date("2036-10-18T09:58:09.996+07:00"),
                "cln": {
                    "id" : "web",
                    "grants" : [ 
                        "password", 
                        "refresh_token"
                    ]
                },
                "uid": 1
            });
            await users.insertOne({
                id: 1,
                un: 'holydog',
                nam: 'Chanon Trising'
            });

            let result = await chai.request(appServer.app)
                .get('/me')
                .set('Authorization', 'Bearer ccdc7ebd4921b3ef8a382b2d3bcee0b21a27558d')
                .send();
            
            chai.expect(result.body).to.eql({
                "id": 1,
                "username": "holydog",
                "name": "Chanon Trising"
            });
        });
    });
});
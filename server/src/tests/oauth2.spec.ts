import * as chai from 'chai';
import * as express from "express";
import { MongoClient, Collection, Db, MongoClientOptions, Long } from 'mongodb';
import chaiHttp = require('chai-http');

import Server from '../server';
import { ConfigTest } from '../config';

let db: Db;
let clients: Collection;
let tokens: Collection;
let users: Collection;

chai.use(chaiHttp);

const app = express();
const router = express.Router();
const appServer = new Server(app, router);

describe('OAuth2', function () {
    before(async () => {
        let mongo: MongoClient = await MongoClient.connect(ConfigTest.MongoUri, ConfigTest.MongoConfig as MongoClientOptions);
        db = mongo.db(ConfigTest.MongoDatabase);

        await appServer.run();

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
        await users.deleteMany({});
        await tokens.deleteMany({});
    });

    after(async () => {
        await clients.deleteMany({});
    });

    describe('POST /oauth/token', async () => {
        it('should return error when email or password invalid', async () => {
            let result = await chai.request(appServer.app)
                .post('/oauth/token')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({
                    grant_type: "password",
                    username: "holydog",
                    password: "whitedog",
                    client_id: "web",
                    client_secret: "160c96fbe9d44794868de4ce617744da"
                });

            chai.expect(result.body.error).to.eql({
                message: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง'
            });
        });
        it('should return access token when login success', async () => {
            await users.insertOne({
                id: Long.fromNumber(1),
                un: "holydog",
                pwd: "AIZtovZqJQNywc5jr0WbR6szTNYW4ZD2aV5St/hhdlD1Lo9aeKEFs9CDWy+Md3ZwMQ==",
                nam: 'Chanon Trising'
            });

            let result = await chai.request(appServer.app)
                .post('/oauth/token')
                .set('content-type', 'application/x-www-form-urlencoded')
                .send({
                    grant_type: "password",
                    username: "holydog",
                    password: "whitedog",
                    client_id: "web",
                    client_secret: "160c96fbe9d44794868de4ce617744da"
                });

            chai.expect(result.body).to.have.property('access_token').that.have.lengthOf(40);
            chai.expect(result.body).to.have.property('refresh_token').that.have.lengthOf(40);
            chai.expect(result.body).to.have.property('expires_in', 360000);
        });
    });
});
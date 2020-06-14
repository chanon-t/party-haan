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
let parties: Collection;
let users: Collection;

chai.use(chaiHttp);

const app = express();
const router = express.Router();
const appServer = new Server(app, router);

describe('Party API', function () {
    before(async () => {
        let mongo: MongoClient = await MongoClient.connect(ConfigTest.MongoUri, ConfigTest.MongoConfig as MongoClientOptions);
        db = mongo.db(ConfigTest.MongoDatabase);

        await appServer.run();

        counters = db.collection('counters');
        clients = db.collection('clients');
        tokens = db.collection('tokens');
        parties = db.collection('parties');
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
        await tokens.insertOne({
            "at": "ccdc7ebd4921b3ef8a382b2d3bcee0b21a27558d",
            "ate": new Date("2030-05-19T13:58:09.996+07:00"),
            "rt": "9cec135512eb88c633388d4db1831c0e099732b4",
            "rte": new Date("2036-10-18T09:58:09.996+07:00"),
            "cln": {
                "id": "web",
                "grants": [
                    "password",
                    "refresh_token"
                ]
            },
            "uid": 1
        });
        await users.insertMany([{
            "id": Long.fromNumber(1),
            "un": "maivet",
            "nam": "Prapatsorn Apiwannarat"
        }, {
            "id": Long.fromNumber(2),
            "un": "dino666",
            "nam": "Dino Narupat"
        }, {
            "id": Long.fromNumber(3),
            "un": "holydog",
            "nam": "Chanon Trising"
        }, {
            "id": Long.fromNumber(4),
            "un": "disney",
            "nam": "Disney Nannapat"
        }]);
    });

    beforeEach(async () => {
        await counters.deleteMany({});
        await parties.deleteMany({});
    });

    after(async () => {
        await clients.deleteMany({});
        await tokens.deleteMany({});
        await users.deleteMany({});
    });

    describe('GET /parties', () => {
        it('should return list of parties with total size sort by create date descending', async () => {
            await parties.insertMany([
                {
                    "id": Long.fromNumber(1),
                    "ttl": "หาร netflix ขาด 3 คน",
                    "qty": {
                        "jn": 0,
                        "tot": 3
                    },
                    "uid": 1,
                    "cdt": new Date("2020-06-08T07:30:00.000+07:00")
                },
                {
                    "id": Long.fromNumber(2),
                    "ttl": "หาร shopify ขาด 5 คน ตัดบัตรเครดิต",
                    "qty": {
                        "jn": 2,
                        "tot": 5
                    },
                    "uid": 2,
                    "cdt": new Date("2020-06-08T13:20:00.000+07:00")
                }
            ]);

            let result = await chai.request(appServer.app)
                .get('/parties')
                .send();

            chai.expect(result.status).to.eql(200);
            chai.expect(result.body).to.have.own.property('total', 2);
            chai.expect(result.body.data.length).to.eql(2);
            chai.expect(result.body.data).to.eql([
                {
                    "id": 2,
                    "picture": "//localhost:3000/images/placeholder-image.png",
                    "title": "หาร shopify ขาด 5 คน ตัดบัตรเครดิต",
                    "quantity": {
                        "join": 2,
                        "total": 5
                    },
                    "create_date": "2020-06-08T13:20:00.000+07:00"
                }, {
                    "id": 1,
                    "picture": "//localhost:3000/images/placeholder-image.png",
                    "title": "หาร netflix ขาด 3 คน",
                    "quantity": {
                        "join": 0,
                        "total": 3
                    },
                    "create_date": "2020-06-08T07:30:00.000+07:00"
                }
            ]);
        });
    });

    describe('GET /parties/:id', () => {
        it('should return party data', async () => {
            await parties.insertOne({
                "id": Long.fromNumber(2),
                "ttl": "หาร shopify ขาด 5 คน ตัดบัตรเครดิต",
                "qty": {
                    "jn": 2,
                    "tot": 5
                },
                "uid": 3,
                "mem": [1, 2],
                "cdt": new Date("2020-06-08T13:20:00.000+07:00")
            });

            let result = await chai.request(appServer.app)
                .get('/parties/2')
                .set('Content-Type', 'application/json');

            chai.expect(result.status).to.eql(200);
            chai.expect(result.body).to.eql({
                id: 2,
                title: 'หาร shopify ขาด 5 คน ตัดบัตรเครดิต',
                quantity: { join: 2, total: 5 },
                members: [
                    { id: 1, name: 'Prapatsorn Apiwannarat' },
                    { id: 2, name: 'Dino Narupat' }
                ],
                creator: { id: 3, name: 'Chanon Trising' },
                create_date: '2020-06-08T13:20:00.000+07:00'
            });
        });
    });

    describe('POST /parties', () => {
        it('should return success when party created', async () => {
            let result = await chai.request(appServer.app)
                .post('/parties')
                .set('Authorization', 'Bearer ccdc7ebd4921b3ef8a382b2d3bcee0b21a27558d')
                .set('Content-Type', 'application/json')
                .send({
                    title: "หาร shopify ขาด 5 คน ตัดบัตรเครดิต",
                    quantity: 5
                });

            chai.expect(result.status).to.eql(200);
            chai.expect(result.body.success).to.eql(true);

            let data = await parties.find({ id: 1 }).project({ _id: 0, cdt: 0 }).toArray();
            chai.expect(data.length).to.equal(1);
            chai.expect(data[0]).to.eql({
                id: 1,
                ttl: 'หาร shopify ขาด 5 คน ตัดบัตรเครดิต',
                qty: { jn: 0, tot: 5 },
                uid: 1
            });
        });
    });

    describe('PUT /parties/:id', () => {
        it('should return success when party updated', async () => {
            await parties.insertOne({
                "id": Long.fromNumber(2),
                "ttl": "หาร shopify ขาด 5 คน ตัดบัตรเครดิต",
                "qty": {
                    "jn": 2,
                    "tot": 5
                },
                "uid": 1,
                "mem": [2, 3],
                "cdt": new Date("2020-06-08T13:20:00.000+07:00")
            });

            let result = await chai.request(appServer.app)
                .put('/parties/2')
                .set('Authorization', 'Bearer ccdc7ebd4921b3ef8a382b2d3bcee0b21a27558d')
                .set('Content-Type', 'application/json')
                .send({
                    title: "หาร nexflix ขาด 4 คน ตัดบัตรเครดิต",
                    quantity: 4
                });

            chai.expect(result.status).to.eql(200);
            chai.expect(result.body.success).to.eql(true);

            let data = await parties.find({ id: 2 }).project({ _id: 0, cdt: 0, udt: 0 }).toArray();
            chai.expect(data.length).to.equal(1);
            chai.expect(data[0]).to.eql({
                id: 2,
                ttl: 'หาร nexflix ขาด 4 คน ตัดบัตรเครดิต',
                qty: { jn: 2, tot: 4 },
                uid: 1,
                mem: [ 2, 3 ]
            });
        });
    });

    describe('PUT /parties/:id/join', () => {
        it('should return success when party joined', async () => {
            await parties.insertOne({
                "id": Long.fromNumber(2),
                "ttl": "หาร shopify ขาด 5 คน ตัดบัตรเครดิต",
                "qty": {
                    "jn": 0,
                    "tot": 5
                },
                "uid": 2,
                "cdt": new Date("2020-06-08T13:20:00.000+07:00")
            });

            let result = await chai.request(appServer.app)
                .put('/parties/2/join')
                .set('Authorization', 'Bearer ccdc7ebd4921b3ef8a382b2d3bcee0b21a27558d')
                .set('Content-Type', 'application/json')
                .send();

            chai.expect(result.status).to.eql(200);
            chai.expect(result.body.success).to.eql(true);

            let data = await parties.find({ id: 2 }).project({ _id: 0, id: 2, qty: 1, mem: 1 }).toArray();
            chai.expect(data.length).to.equal(1);
            chai.expect(data[0]).to.eql({
                id: 2,
                qty: { jn: 1, tot: 5 },
                mem: [ 1 ]
            });
        });
    });

    describe('PUT /parties/:id/leave', () => {
        it('should return success when party left', async () => {
            await parties.insertOne({
                "id": Long.fromNumber(2),
                "ttl": "หาร shopify ขาด 5 คน ตัดบัตรเครดิต",
                "qty": {
                    "jn": 1,
                    "tot": 5
                },
                "uid": 2,
                "mem": [ Long.fromNumber(1) ],
                "cdt": new Date("2020-06-08T13:20:00.000+07:00")
            });

            let result = await chai.request(appServer.app)
                .put('/parties/2/leave')
                .set('Authorization', 'Bearer ccdc7ebd4921b3ef8a382b2d3bcee0b21a27558d')
                .set('Content-Type', 'application/json')
                .send();

            chai.expect(result.status).to.eql(200);
            chai.expect(result.body.success).to.eql(true);

            let data = await parties.find({ id: 2 }).project({ _id: 0, id: 2, qty: 1, mem: 1 }).toArray();
            chai.expect(data.length).to.equal(1);
            chai.expect(data[0]).to.eql({
                id: 2,
                qty: { jn: 0, tot: 5 },
                mem: []
            });
        });
    });

    // describe('POST /signup', () => {
    //     it('should return success when user was created', async () => {            
    //         let result = await chai.request(appServer.app)
    //             .post('/signup')
    //             .set('Content-Type', 'application/json')
    //             .send({
    //                 username: 'holydog',
    //                 password: 'whitedog',
    //                 name: 'Chanon Trising',
    //             });
    //         let user = await users.findOne({ id: 1 });

    //         chai.expect(result.body.success).to.equal(true);

    //         chai.expect(user).to.be.not.null;
    //         chai.expect(user).to.have.property('id', 1);
    //         chai.expect(user).to.have.property('un', 'holydog');
    //         chai.expect(user).to.have.property('nam', 'Chanon Trising');
    //     });
    //     it('should return error when username already exists', async () => {  
    //         await users.insertOne({
    //             id: Long.fromNumber(1),
    //             un: "holydog",
    //             nam: 'Chanon Trising'
    //         });         

    //         let result = await chai.request(appServer.app)
    //             .post('/signup')
    //             .set('Content-Type', 'application/json')
    //             .send({
    //                 username: 'holydog',
    //                 password: 'whitedog',
    //                 name: 'Prapatsorn Apiwannarat',
    //             });

    //         chai.expect(result.body.error).to.eql({
    //             message: 'this_username_already_used'
    //         });
    //     });
    // });

    // describe('GET /me', () => {
    //     it('should return unauthorized error when token invalid', async () => {
    //         let result = await chai.request(appServer.app)
    //             .get('/me')
    //             .send();

    //         chai.expect(result.body.error).to.eql({
    //             code: 101, 
    //             message: 'unauthorized'
    //         });
    //     });
    //     it('should return user information when token valid', async () => {            
    //         await tokens.insertOne({
    //             "at": "ccdc7ebd4921b3ef8a382b2d3bcee0b21a27558d",
    //             "ate": new Date("2030-05-19T13:58:09.996+07:00"),
    //             "rt": "9cec135512eb88c633388d4db1831c0e099732b4",
    //             "rte": new Date("2036-10-18T09:58:09.996+07:00"),
    //             "cln": {
    //                 "id" : "web",
    //                 "grants" : [ 
    //                     "password", 
    //                     "refresh_token"
    //                 ]
    //             },
    //             "uid": 1
    //         });
    //         await users.insertOne({
    //             id: 1,
    //             un: 'holydog',
    //             nam: 'Chanon Trising'
    //         });

    //         let result = await chai.request(appServer.app)
    //             .get('/me')
    //             .set('Authorization', 'Bearer ccdc7ebd4921b3ef8a382b2d3bcee0b21a27558d')
    //             .send();

    //         chai.expect(result.body).to.eql({
    //             "id": 1,
    //             "username": "holydog",
    //             "name": "Chanon Trising"
    //         });
    //     });
    // });
});
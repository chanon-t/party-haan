import * as express from "express";
import * as bodyParser from "body-parser";
import * as fileUpload from 'express-fileupload';
import * as mongodb from 'mongodb';
import * as path from 'path';

var cookieParser = require("cookie-parser");
var cors = require("cors");

import { Config, ConfigTest } from "./config";
import { OAuth2 } from "./oauth2";

import { UserApi } from "./api/user.api";
import { PartyApi } from "./api/party.api";
import { FileApi } from "./api/file.api";

export default class Server {

    public app: express.Application;
    public router: express.Router;
    public prefix: string;
    public db: mongodb.Db;
    public mongoClient: mongodb.MongoClient;
    public config: any;

    constructor(app: express.Application, router: express.Router = null, prefix: string = null) {
        this.app = app;

        if (app) {
            this.app = app;
            this.router = router;
            this.prefix = prefix;
        }
        else {
            this.app = express();
            this.router = express.Router();
        }

        this.router.use(cors());
        this.config = Server.getConfig();
    }

    public static getConfig() {        
        if (process.env.NODE_ENV && process.env.NODE_ENV.trim() == 'test') {
            return ConfigTest;
        }
        return Config;
    }

    private initial(): Promise<mongodb.MongoClient> {
        if (!this.prefix) {
            this.prefix = "/";
        }
        this.app.disable('etag');

        this.router.use(cookieParser('party-haan'));
        this.router.use(bodyParser.json());
        this.router.use(bodyParser.urlencoded({ extended: true }));
        this.router.use(fileUpload());

        this.app.use(this.config.FilePath, express.static(path.join(__dirname, "../public")));
        this.app.use(this.config.FilePath, express.static(path.join(__dirname, "../public")));

        this.router.use(function (req, res, next) {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,PUT,PATCH,DELETE');
            res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

            next();
        });

        return mongodb.MongoClient.connect(this.config.MongoUri, this.config.MongoConfig as mongodb.MongoClientOptions);
    }

    private api(): void {
        let oauth2: OAuth2 = new OAuth2(this.router, this.db);

        new UserApi(this.router, this.db, oauth2);
        new PartyApi(this.router, this.db, oauth2);
        new FileApi(this.router);

        this.router.get('/version', (req: express.Request, res: express.Response) => {
            let v = this.config.Version;

            res.json({ version: `${v.base}.${v.major}.${v.minor}` });
        });

        this.app.use(this.prefix, this.router);
    }

    async createIndex(db: mongodb.Db, collection: mongodb.Collection, key: string, option: any): Promise<boolean> { 
        if (!await db.listCollections({ name: collection.collectionName }).hasNext()) {
            await db.createCollection(collection.collectionName);
        }

        if (!await collection.indexExists(key)) {
            collection.createIndex(key, option);
        }
        return true;
    }

    public async run(): Promise<any> {
        let mongoClient: mongodb.MongoClient = await this.initial();
        let db: mongodb.Db = mongoClient.db(this.config.MongoDatabase);

        this.db = db;
        this.mongoClient = mongoClient;

        let tokens: mongodb.Collection = db.collection('tokens');        
        await this.createIndex(db, tokens, 'at', { name: 'pk_1', unique: true });
        await this.createIndex(db, tokens, 'rt', { name: 'pk_2', unique: true });

        let users: mongodb.Collection = db.collection('users');
        await this.createIndex(db, users, 'id', { name: 'pk_1', unique: true });
        await this.createIndex(db, users, 'un', { name: 'pk_2', unique: true });

        let parties: mongodb.Collection = db.collection('parties');        
        await this.createIndex(db, parties, 'id', { name: 'pk_1', unique: true });
        await this.createIndex(db, parties, 'uid', { name: 'fk_1' });
        
        this.api();
    }
}
  
if (process.env.NODE_ENV && process.env.NODE_ENV.trim() == 'dev') {
    const app = express();
    const router = express.Router();
    const appServer = new Server(app, router);
    appServer.run().then(() => {
        appServer.app.listen(appServer.config.Port, () => {
            console.log(`Listening on: ${appServer.config.Port} at ` + new Date().toString());
        });
    });
}

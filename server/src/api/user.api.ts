import * as mongodb from 'mongodb';
import * as express from 'express';

import { OAuth2 } from '../oauth2';
import { Translation as t } from '../translate/translation';
import { Convert } from '../util/convert';
import { Db } from './db.api';

import { UserModel } from '../models/user.model';
import { ErrorModel } from '../models/error.model';
export class UserApi {
    private users: mongodb.Collection;
    private db: mongodb.Db;

    constructor(router: express.Router, db: mongodb.Db, oauth2: OAuth2) {
        this.db = db;
        
        this.users = db.collection('users');

        router.get('/me', oauth2.authenticate, (req: express.Request & { user: UserModel }, res: express.Response) => {
            this.me(req, res);
        });

        router.post('/signup', (req: express.Request, res: express.Response) => {
            this.signUp(req, res);
        });
    }

    async me(req: express.Request & { user: UserModel }, res: express.Response) {
        res.json(UserModel.getObject(req.user));
    }

    async signUp(req: express.Request, res: express.Response) {
        let bd: any = req.body;

        let data: UserModel = {
            id: null,
            un: bd.username.trim().toLowerCase(),
            pwd: Convert.toHashPassword(bd.password),
            nam: bd.name,
            cdt: new Date()
        };

        let isDuplicate: boolean = await Db.isDuplicate(this.users, 'un', bd.username);
        if (isDuplicate) {
            res.json(new ErrorModel(
                t.translate('this_username_already_used', req.query.lang as string)
            ));
        }
        else {
            let id: number = await Db.createId(this.db, this.users.collectionName);            
            data.id = mongodb.Long.fromNumber(id);
            
            let result: mongodb.InsertOneWriteOpResult<any> = await this.users.insertOne(data);            
            res.json({ 
                success: result.result.ok == 1 
            });
        }
    }
}
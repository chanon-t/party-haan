import * as mongodb from 'mongodb';
import * as express from 'express';

import { OAuth2 } from '../oauth2';
import { Translation as t } from '../translate/translation';

import { PartyModel } from '../models/party.model';
import { ErrorModel } from '../models/error.model';
import { UserModel } from '../models/user.model';
import { Convert } from '../util/convert';
import { Db } from './db.api';

export class PartyApi {
    private db: mongodb.Db;
    private parties: mongodb.Collection;

    constructor(router: express.Router, db: mongodb.Db, oauth2: OAuth2) {
        this.db = db;

        this.parties = db.collection('parties');

        router.get('/parties', (req: express.Request, res: express.Response) => {
            this.getParties(req, res);
        });

        router.get('/parties/:id', (req: express.Request, res: express.Response) => {
            this.getPartyById(req, res);
        });

        router.post('/parties', oauth2.authenticate, (req: express.Request & { user: UserModel }, res: express.Response) => {
            this.createParty(req, res);
        });

        router.put('/parties/:id', oauth2.authenticate, (req: express.Request & { user: UserModel }, res: express.Response) => {
            this.updateParty(req, res);
        });

        router.put('/parties/:id/join', oauth2.authenticate, (req: express.Request & { user: UserModel }, res: express.Response) => {
            this.joinParty(req, res);
        });

        router.put('/parties/:id/leave', oauth2.authenticate, (req: express.Request & { user: UserModel }, res: express.Response) => {
            this.leaveParty(req, res);
        });

        router.delete('/parties/:id', oauth2.authenticate, (req: express.Request & { user: UserModel }, res: express.Response) => {
            this.deleteParty(req, res);
        });
    }

    async getParties(req: express.Request, res: express.Response) {
        var dt = new Date();
        dt.setSeconds( dt.getSeconds() + 5 );

        let page: any = Convert.toPageRange(+req.query.page, +req.query.size);
        let fields: any = { id: 1, ttl: 1, pic: 1, qty: 1, cdt: 1 };
        let filter: any = { 
            // $expr: { $lt: [ "$qty.jn" , "$qty.tot" ] },
            iatv: { $ne: true } 
        };

        let products: any[] = [];
        let data: any[] = await this.parties
            .find(filter)
            .project(fields)
            .skip(page.start).limit(page.limit)
            .sort({ cdt: -1 })
            .toArray();

        products = data.map(o => {
            return PartyModel.getObject(o, true);
        });
        let count: number = await this.parties.countDocuments(filter, {});
        var total = (count) ? count : 0;
        res.json({
            total: total,
            data: products
        });
    }

    async getPartyById(req: express.Request, res: express.Response) {
        let fields: any = {
            id: 1, ttl: 1, pic: 1, qty: 1, cdt: 1, udt: 1,
            members: {
                id: 1,
                nam: 1
            },
            creator: {
                id: 1,
                nam: 1
            }
        };

        let filter: any = [{
            $match: {
                id: +req.params.id,
                iatv: { $ne: true }
            }
        }, {
            $lookup: {
                from: "users",
                localField: "mem",
                foreignField: "id",
                as: "members"
            }
        }, {
            $lookup: {
                from: "users",
                localField: "uid",
                foreignField: "id",
                as: "creator"
            }
        }, {
            $addFields: {
                creator: { $arrayElemAt: ["$creator", 0] }
            }
        }, {
            $project: fields
        }];

        let data: any[] = await this.parties.aggregate(filter).toArray();
        if (data.length > 0) {
            res.json(PartyModel.getObject(data[0]));
        }
        else {
            res.json(new ErrorModel(
                t.translate('party_not_found', req.query.lang as string)
            ));
        }
    }

    async createParty(req: express.Request & { user: UserModel }, res: express.Response) {
        let bd: any = req.body;

        let data: PartyModel = {
            id: null,
            ttl: bd.title,
            qty: {
                jn: 0,
                tot: +bd.quantity
            },
            uid: req.user.id,
            cdt: new Date()
        }
        if (bd.picture) {
            data.pic = bd.picture;
        }
        let id: number = await Db.createId(this.db, this.parties.collectionName);
        data.id = mongodb.Long.fromNumber(id);

        let result: mongodb.InsertOneWriteOpResult<any> = await this.parties.insertOne(data);
        res.json({
            success: result.result.ok == 1,
            id: data.id
        });
    }

    async updateParty(req: express.Request & { user: UserModel }, res: express.Response) {
        let bd: any = req.body;

        let filter: any = {
            id: +req.params.id,
            uid: +req.user.id
        };
        let data: any = {
            ttl: bd.title,
            "qty.tot": +bd.quantity,
            udt: new Date()
        };
        let unset: any = null;
        if (bd.picture) {
            data.pic = bd.picture;
        }
        else {
            unset = { $unset: { pic: 1 } }
        }

        let result: mongodb.UpdateWriteOpResult = await this.parties.updateOne(filter, { $set: data, ...unset });
        if (result.matchedCount == 0) {
            res.json(new ErrorModel(
                t.translate('no_data_was_updated', req.query.lang as string)
            ));
        }
        else {
            res.json({
                success: result.result.ok == 1
            });
        }
    }

    async joinParty(req: express.Request & { user: UserModel }, res: express.Response) {
        let filter: any = {
            id: +req.params.id,
            uid: { $ne: req.user.id },
            $expr: {
                $lt: ["$qty.jn", "$qty.tot"]
            }
        };
        let update: any = {
            $inc: { "qty.jn": 1 },
            $push: { mem: req.user.id },
            $set: { udt: new Date() }
        };
        let opts: mongodb.FindOneAndReplaceOption = {
            returnOriginal: false
        };

        let result: mongodb.FindAndModifyWriteOpResultObject<any> = await this.parties.findOneAndUpdate(filter, update, opts);        
        res.json({
            success: result.ok == 1,
            data: result.value
        });
    }

    async leaveParty(req: express.Request & { user: UserModel }, res: express.Response) {
        let filter: any = {
            id: +req.params.id,
            mem: req.user.id,
            "qty.jn": {
                $gt: 0
            }
        };
        let update: any = {
            $inc: { "qty.jn": -1 },
            $pull: { mem: req.user.id },
            $set: { udt: new Date() }
        };

        let result: mongodb.FindAndModifyWriteOpResultObject<any> = await this.parties.findOneAndUpdate(filter, update);
        res.json({
            success: result.ok == 1
        });
    }

    async deleteParty(req: express.Request & { user: UserModel }, res: express.Response) {
        let filter: any = {
            id: +req.params.id,
            uid: +req.user.id
        };
        let update: any = { $set: { iatv: true } };
        let result: mongodb.UpdateWriteOpResult = await this.parties.updateOne(filter, update);
        res.json({
            success: result.result.ok == 1
        });
    }
}
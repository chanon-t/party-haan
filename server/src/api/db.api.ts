import * as mongodb from 'mongodb';

export const Db = {
    createId,
    isDuplicate
};

async function createId(db: mongodb.Db, cname: string): Promise<number> {
    let opts: mongodb.FindOneAndReplaceOption = {
        upsert: true,
        returnOriginal: false
    };
    let coll: mongodb.Collection = db.collection('counters');
    let data: mongodb.FindAndModifyWriteOpResultObject<any> = await coll.findOneAndUpdate({ _id: cname }, { $inc: { seq: mongodb.Long.fromNumber(1) } }, opts)
    return +data.value.seq;
}

async function isDuplicate(coll: mongodb.Collection, field: string, value: any, params: any = null): Promise<boolean> {
    let filter = {};
    filter[field] = { $regex: "^" + value + "$", $options: "i" };
    if (typeof params == 'object') {
        Object.assign(filter, params);
    }
    const count = await coll.countDocuments(filter);
    return count > 0;
}
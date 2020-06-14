import * as mongodb from 'mongodb';
import * as dateFormat from 'dateformat';

import { Format } from '../constants';
import { UserModel } from './user.model';
import { Config } from '../config';

class QuantityModel {
    jn?: number; // join
    tot?: number; // total

    static getObject?(data: QuantityModel): any {
        let o: any = {};

        if (data.jn != null) o.join = data.jn;
        if (data.tot != null) o.total = data.tot;

        return o;
    }
}

export class PartyModel {
    id?: number | mongodb.Long; // id
    ttl?: string; // title
    pic?: string; // picture
    qty?: QuantityModel; // quantity
    uid?: number | mongodb.Long; // user_id
    mem?: number[] | mongodb.Long[] // members
    cdt?: Date; // create_date
    udt?: Date; // update_date
    iatv?: boolean; // inactive

    members?: UserModel[];
    creator?: UserModel;

    static getObject?(data: PartyModel, defaultPic: boolean = false): any {
        let o: any = {};

        if (data.id != null) o.id = data.id;
        if (data.ttl != null) o.title = data.ttl;
        if (data.pic != null) o.picture = Config.ImagePath + data.pic;
        if (defaultPic && !data.pic) {
            o.picture = Config.ImagePath + '/placeholder-image.png';
        }
        if (data.qty != null) o.quantity = QuantityModel.getObject(data.qty);
        if (data.iatv != null) o.inactive = data.iatv;

        if (data.members != null) o.members = data.members.map(o => UserModel.getObject(o));
        if (data.creator != null) o.creator = UserModel.getObject(data.creator);

        if (data.cdt != null) o.create_date = dateFormat(data.cdt, Format.LOCAL_DATE_TIME);
        if (data.udt != null) o.update_date = dateFormat(data.udt, Format.LOCAL_DATE_TIME);

        return o;
    }
}
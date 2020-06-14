import * as mongodb from 'mongodb';

export class UserModel {
    id?: number | mongodb.Long; // id
    un?: string; // username
    pwd?: string; // password
    nam?: string; // name
    cdt?: Date; // create_date
    udt?: Date; // update_date
    iatv?: boolean; // inactive

    static getObject?(data: UserModel): any {
        let o: any = {};

        if (data.id != null) o.id = data.id;
        if (data.un != null) o.username = data.un;
        if (data.nam != null) o.name = data.nam;
        if (data.cdt != null) o.create_date = data.cdt;
        if (data.udt != null) o.update_date = data.udt;
        if (data.iatv != null) o.inactive = data.iatv;
        
        return o;
    }
}
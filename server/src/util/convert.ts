import * as crypto from 'crypto';

export const Convert = {
    toRandomText,
    toHashPassword,
    toPageRange,
    toRandomFileName
};

function toRandomText(length: number): string {
    var text = "";
    var possible = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function toHashPassword(password: string, passwordHash: string = null) {
    let version = Buffer.alloc(1) // 1 zero-filled byte
    if (passwordHash) {
        let hashBuff = Buffer.from(passwordHash, 'base64');
        let salt = Buffer.from(new Uint8Array(hashBuff.slice(1, 17)));
        let hash = crypto.pbkdf2Sync(password, salt, 1000, 32, 'sha1');
        return Buffer.concat([version, salt, hash]).toString('base64');
    }
    else {
        let salt = crypto.randomBytes(16);
        let hash = crypto.pbkdf2Sync(password, salt, 1000, 32, 'sha1')
        return Buffer.concat([version, salt, hash]).toString('base64');
    }
}

function toPageRange(page: number, size: number): any {
    let limit: number = Math.min(100, (size > 0) ? size : 10);
    let start: number = Math.max(0, ((page || 1) - 1) * limit);
    return {
        start: start,
        limit: limit
    }
}

function toRandomFileName(fileName: string): string {
    return new Date().getTime() + '_' + Convert.toRandomText(8) + '-' + fileName;
}
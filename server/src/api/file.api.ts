import * as express from 'express';
import * as fs from 'fs';
import * as path from 'path';

var sharp = require('sharp');

import { Config } from '../config';
import { Translation as t } from '../translate/translation';
import { ErrorModel } from '../models/error.model';
import fileUpload = require('express-fileupload');
import { Convert } from '../util/convert';

export class FileApi {
    fileDir: string;

    constructor(router: express.Router) {        
        this.fileDir = path.join(__dirname, "../../public");
        if (!fs.existsSync(this.fileDir)) {
            fs.mkdirSync(this.fileDir);
        }

        router.post('/pictures/upload', (req, res) => {
            this.uploadPicture(req, res);
        });

        router.get(Config.FilePath + '*_[w]:w[x][h]:h*', this.getResizePicture.bind(this));
        router.get(Config.FilePath + '*_[w]:w', this.getResizePicture.bind(this));
        router.get(Config.FilePath + '*_[h]:h*', this.getResizePicture.bind(this));
    }

    private upload(files: fileUpload.UploadedFile[], dir: string): Promise<any> {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        let names: string[] = [];
        return new Promise((resolve, reject) => {
            let upload = (index: number) => {
                let i: fileUpload.UploadedFile = files[index];
                if (files[index]) {
                    let fileName = Convert.toRandomFileName(i.name);
                    i.mv(dir + '/' + fileName, (err) => {
                        if (err) {
                            reject(err);
                        }
                        names.push('/' + fileName);
                        upload(index + 1);
                    });
                }
                else {
                    resolve(names);
                }
            }
            upload(0);
        });
    }

    private getFiles(files: (fileUpload.UploadedFile | fileUpload.UploadedFile[])): fileUpload.UploadedFile[] {
        let f: fileUpload.UploadedFile[] = [];
        if (files.constructor === Array) {
            f = (<fileUpload.UploadedFile[]>files);
        }
        else {
            f.push((<fileUpload.UploadedFile>files));
        }
        return f;
    }

    async getResizePicture(req: express.Request, res: express.Response) {
        let filePath: string = req.params['0'];
        if (!filePath) {
            res.json(new ErrorModel(t.translate('invalid_parameter')));
        }
        else if (!fs.existsSync(this.fileDir + filePath)) {
            res.json(new ErrorModel(t.translate('file_not_found')));
        }
        else {
            let fileInfo: any = path.parse(filePath);

            let widthString = req.params.w;
            let heightString = req.params.h;

            let width: number;
            let height: number;
            if (widthString) {
                width = parseInt(widthString);
            }
            if (heightString) {
                height = parseInt(heightString);
            }

            let format: string = fileInfo.ext.substring(1).toLowerCase();
            let transform = sharp(this.fileDir + filePath);
            transform = transform.toFormat(format);

            if (width || height) {
                transform = transform.resize(width, height);
            }
            transform.toBuffer().then((image: any) => {
                res.end(image, 'binary');
            });
        }
    }

    async uploadPicture(req: express.Request, res: express.Response) {
        let data: any = await this.upload(this.getFiles(req.files.file), this.fileDir)
        res.json(data);
    }
}
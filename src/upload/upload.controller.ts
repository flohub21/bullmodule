import {Body, Controller, Post} from '@nestjs/common';
import { UploadService} from '../upload/upload.service';
import { Param } from  '@nestjs/common';
import { UseInterceptors, UploadedFile } from  '@nestjs/common';
import { diskStorage } from  'multer';
import { extname } from  'path';
import { Get, Res } from  '@nestjs/common';
import {FileInterceptor} from "@nestjs/platform-express";
import {ServerResponse} from "http";
import { MulterModule } from '@nestjs/platform-express';
import * as bodyParser from "body-parser";
import {chmodSync, copyFile, unlink} from "fs";
import * as fs from "fs";


@Controller('upload')
export class UploadController {

    constructor(private readonly UploadService: UploadService) {

    }

    @Post('file')

    @UseInterceptors(FileInterceptor('file',
        {

                storage: diskStorage({
                    destination: (req: any, file: any, cb: any) => {
                        // console.log('--------------------------------------------------------');
                        // //console.log(req);
                        // console.log('--------------------------------------------------------');
                        // console.log(file);
                        // console.log('--------------------------------------------------------');
                        // console.log(cb);
                        //file.chmodSync('./uploadedFiles','777')
                        cb(null,'./uploadedFiles');
                    },
                    filename: (req, file, cb) => {
                        return cb(null, `${file.originalname}`)
                    }
                })
        }
    )
    )
    //This function is used to copy the file in the folder 'uploadedFiles' into the right folder wich was chosen in the form. After the copy, the file is deleted in the folder 'uploadedFiles' to keep only the one that was copied . Form's datas can be taken into the @body
      async serveFile(@Param('fileName') fileName, @Body() resBody, @Res() res): Promise<any> {
        console.log(res.req.file);
        console.log(resBody.folder);
        console.log(resBody.pod);
        console.log(resBody.customerId);

        //test if the folder customerId exist
        if (!fs.existsSync('./uploadedFiles/'+resBody.folder+'/'+resBody.customerId+'/')){
            fs.mkdirSync('./uploadedFiles/'+resBody.folder+'/'+resBody.customerId+'/');
        }

        //test if the folder POD exist
        if (!fs.existsSync('./uploadedFiles/'+resBody.folder+'/'+resBody.customerId+'/'+resBody.pod+'/')){
            fs.mkdirSync('./uploadedFiles/'+resBody.folder+'/'+resBody.customerId+'/'+resBody.pod+'/');
        }
        //copy the file into the right folder wich was chosen in the form
          await copyFile('./uploadedFiles/'+res.req.file.originalname,'./uploadedFiles/'+resBody.folder+'/'+resBody.customerId+'/'+resBody.pod+'/'+res.req.file.originalname, errCopy => {
             if (errCopy) throw errCopy;
             console.log('copied')
                  // delete the file in the folder 'uploadedFiles' to keep only the one that was copied
                  unlink('./uploadedFiles/'+res.req.file.originalname, errDelete => {
                      if (errDelete) throw errDelete;
                      console.log('Deleted')
                    }
                  )
          }
         )

    }
//
// test(@Body() body){
//     console.log(body);
//     console.log('--------');
// }

// getDesti(@Body() resBody){
//     return resBody.folder;
// }
}

import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Get,
  Param,
  Res,
  Delete,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { FilesService } from './schemas/service/files.service';
import * as fs from 'fs';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  // ------------------- UPLOAD -------------------
  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads', // make sure this folder exists
        filename: (req, file, callback) => {
          const uniqueName =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, uniqueName + extname(file.originalname));
        },
      }),
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.filesService.saveFile(file);
  }

  // ------------------- GET ALL FILES -------------------
  @Get()
  getAllFiles() {
    return this.filesService.findAll();
  }

  @Get('view/:id')
async viewFile(@Param('id') id: string, @Res() res: Response) {
  const file = await this.filesService.findById(id);

  const filePath = join(process.cwd(), 'uploads', file.filename);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    throw new NotFoundException('File not found on server');
  }

  // Define which types can be shown inline
  const inlineTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
  ];

  // Word, Excel, text will be forced to download
  const disposition = inlineTypes.includes(file.mimetype) ? 'inline' : 'attachment';

  res.set({
    'Content-Type': file.mimetype,
    'Content-Disposition': `${disposition}; filename="${file.originalName}"`,
  });

  return res.sendFile(file.filename, { root: join(process.cwd(), 'uploads') });
}


  // ------------------- DOWNLOAD -------------------
  @Get('download/:id')
  async downloadFile(@Param('id') id: string, @Res() res: Response) {
    const file = await this.filesService.findById(id);

    const filePath = join(process.cwd(), 'uploads', file.filename);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found on server');
    }

    return res.download(filePath, file.originalName);
  }

  // ------------------- DELETE -------------------
  @Delete(':id')
  async deleteFile(@Param('id') id: string) {
    return this.filesService.deleteFile(id);
  }
}

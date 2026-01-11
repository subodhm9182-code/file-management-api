import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { File } from '../file.schema';
import * as fs from 'fs';


@Injectable()
export class FilesService {
  constructor(
    @InjectModel(File.name)
    private fileModel: Model<File>,
  ) {}

  async saveFile(file: Express.Multer.File) {
    const createdFile = new this.fileModel({
      originalName: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
    });

    return createdFile.save();
  }

  async findAll() {
    return this.fileModel.find().sort({ createdAt: -1 });
  }

  async findById(id: string) {
    const file = await this.fileModel.findById(id);
    if (!file) throw new NotFoundException('File not found');
    return file;
  }


  async deleteFile(id: string) {
  const file = await this.findById(id);

  // delete from disk
  if (fs.existsSync(file.path)) {
    fs.unlinkSync(file.path);
  }

  // delete from DB
  await this.fileModel.findByIdAndDelete(id);

  return { message: 'File deleted successfully' };
}
}

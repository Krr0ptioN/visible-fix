import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import appConfig from '../../app.config';
import { FilesService } from './files.service';

const MAX_FILE_SIZE_BYTES = appConfig().objectStorage.maxFileSizeBytes;
type UploadedEvidenceFile = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

@Controller()
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('files/evidence')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        files: 1,
        fileSize: MAX_FILE_SIZE_BYTES,
      },
    })
  )
  uploadEvidence(@UploadedFile() file: UploadedEvidenceFile | undefined) {
    return this.filesService.uploadEvidence(file);
  }
}

import { ApiProperty } from '@nestjs/swagger';

export class CreateFileDto {
  @ApiProperty({ example: 'example.png' })
  originalName: string;

  @ApiProperty()
  filename: string;

  @ApiProperty()
  mimetype: string;

  @ApiProperty()
  size: number;

  @ApiProperty()
  path: string;
}

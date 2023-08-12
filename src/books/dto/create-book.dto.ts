import { ApiProperty } from '@nestjs/swagger';

export class CreateBookDto {
  @ApiProperty({
    description: 'Title of the book',
    example: 'The Great Gatsby',
  })
  title: string;

  @ApiProperty({
    description: 'Author of the book',
    example: 'F. Scott Fitzgerald',
  })
  author: string;

  @ApiProperty({
    description: 'Year of publication',
    example: 1925,
  })
  publishedYear: number;
}

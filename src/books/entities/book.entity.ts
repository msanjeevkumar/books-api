import { ApiProperty } from '@nestjs/swagger';

export class Book {
  @ApiProperty({
    description: 'Unique identifier of the book',
    example: '7f6922db-248a-4718-9810-5973a27be272',
  })
  id: string;

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

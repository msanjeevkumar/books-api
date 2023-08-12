import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export const createBookSchema = Joi.object({
  title: Joi.string().required(),
  author: Joi.string().required(),
  publishedYear: Joi.number()
    .integer()
    .min(1000)
    .max(new Date().getFullYear())
    .required(),
}).strict(true);

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
    maximum: new Date().getFullYear(),
    minimum: 1000,
  })
  publishedYear: number;
}

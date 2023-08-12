import { PartialType } from '@nestjs/swagger';
import { CreateBookDto } from './create-book.dto';
import * as Joi from 'joi';

export const updateBookDtoSchema = Joi.object({
  title: Joi.string().optional(),
  author: Joi.string().optional(),
  publishedYear: Joi.number()
    .integer()
    .min(1000)
    .max(new Date().getFullYear())
    .optional(),
}).or('title', 'author', 'publishedYear');

export class UpdateBookDto extends PartialType(CreateBookDto) {}

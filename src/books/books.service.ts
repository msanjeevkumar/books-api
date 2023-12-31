import { Injectable, NotFoundException } from '@nestjs/common';
import { uuid } from 'uuidv4';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Sequelize } from 'sequelize-typescript';
import { QueryTypes } from 'sequelize';
import { Book } from './entities/book.entity';
import { SqlQuery } from './sql-query.enum';

@Injectable()
export class BooksService {
  constructor(private readonly sequelize: Sequelize) {}

  async create(createBookDto: CreateBookDto) {
    const book = { id: uuid(), ...createBookDto };
    await this.sequelize.query(SqlQuery.InsertBook, {
      type: QueryTypes.INSERT,
      replacements: {
        ...book,
      },
    });

    return book;
  }

  async findAll(): Promise<Book[]> {
    return this.sequelize.query(SqlQuery.SelectAllBooks, {
      type: QueryTypes.SELECT,
    });
  }

  async findOne(id: string): Promise<Book> {
    const book: Book = await this.sequelize.query(SqlQuery.SelectBookById, {
      type: QueryTypes.SELECT,
      replacements: { id },
      plain: true,
    });

    if (!book) {
      this.throwNotFoundException(id);
    }

    return book;
  }

  async update(id: string, updateBookDto: UpdateBookDto): Promise<void> {
    const existingBook = await this.findOne(id);

    const fieldMappings = [
      { key: 'title', column: 'title' },
      { key: 'author', column: 'author' },
      {
        key: 'publishedYear',
        column: 'publishedYear',
      },
    ];

    const updateFields = fieldMappings
      .filter(
        ({ key }) =>
          updateBookDto[key] !== undefined &&
          updateBookDto[key] !== existingBook[key],
      )
      .map((mapping) => `${mapping.column} = :${mapping.key}`);

    if (updateFields.length === 0) {
      return; // No updates needed
    }

    const fields = updateFields.join(', ');
    const updateQuery = SqlQuery.UpdateBook.replace('{fields}', fields);

    const replacements = { id, ...updateBookDto };

    await this.sequelize.query(updateQuery, {
      type: QueryTypes.UPDATE,
      replacements,
    });
  }

  async remove(id: string): Promise<void> {
    const [, meta] = (await this.sequelize.query(SqlQuery.DeleteBook, {
      type: QueryTypes.RAW,
      replacements: { id },
    })) as [any, { affectedRows: number }];

    if (meta.affectedRows === 0) {
      this.throwNotFoundException(id);
    }
  }

  private throwNotFoundException(id: string) {
    throw new NotFoundException(`Book with id:${id} not found`);
  }
}

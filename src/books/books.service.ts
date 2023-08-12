import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { uuid } from 'uuidv4';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Sequelize } from 'sequelize-typescript';
import { QueryTypes } from 'sequelize';
import { Book } from './entities/book.entity';

@Injectable()
export class BooksService {
  constructor(private readonly sequelize: Sequelize) {}

  async create(createBookDto: CreateBookDto) {
    const insertQuery = `
        INSERT INTO books_db.books (id, title, author, publishedYear)
        VALUES (:id, :title, :author, :publishedYear);
    `;

    const book = { id: uuid(), ...createBookDto };
    await this.sequelize.query(insertQuery, {
      type: QueryTypes.INSERT,
      replacements: {
        ...book,
      },
    });

    return book;
  }

  async findAll(): Promise<Book[]> {
    const selectAllQuery = `SELECT * FROM books_db.books`;
    return this.sequelize.query(selectAllQuery, {
      type: QueryTypes.SELECT,
    });
  }

  async findOne(id: string): Promise<Book> {
    const selectOneQuery = `SELECT * FROM books_db.books WHERE id = :id`;
    const book: Book = await this.sequelize.query(selectOneQuery, {
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
    if (Object.keys(updateBookDto).length === 0) {
      throw new BadRequestException('At least one field is needed to update');
    }

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

    const updateQuery = `
      UPDATE books_db.books
      SET
        ${updateFields.join(', ')}
      WHERE id = :id
    `;

    const replacements = { id, ...updateBookDto };

    await this.sequelize.query(updateQuery, {
      type: QueryTypes.UPDATE,
      replacements,
    });
  }

  async remove(id: string): Promise<void> {
    const deleteQuery = `DELETE FROM books_db.books WHERE id = :id`;
    const [, meta] = (await this.sequelize.query(deleteQuery, {
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

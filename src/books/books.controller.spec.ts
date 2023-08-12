import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import {
  HttpStatus,
  INestApplication,
  NotFoundException,
} from '@nestjs/common';
import { Book } from './entities/book.entity';
import * as request from 'supertest'; // Import supertest for HTTP requests
import { Sequelize } from 'sequelize-typescript';
import { uuid } from 'uuidv4';

describe('BooksController', () => {
  let app: INestApplication;
  let booksController: BooksController;
  let booksService: BooksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [BooksService, { provide: Sequelize, useValue: {} }],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    booksController = module.get<BooksController>(BooksController);
    booksService = module.get<BooksService>(BooksService);
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(booksController).toBeDefined();
  });

  describe('POST /api/books', () => {
    it('should create a book with valid input', async () => {
      const createBookDto: CreateBookDto = {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        publishedYear: 1925,
      };

      jest
        .spyOn(booksService, 'create')
        .mockResolvedValueOnce({ id: uuid(), ...createBookDto });

      const response = await request(app.getHttpServer())
        .post('/api/books')
        .send(createBookDto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toEqual(expect.objectContaining(createBookDto));
    });

    it('should return validation error for missing title', async () => {
      const invalidCreateBookDto: Partial<CreateBookDto> = {
        author: 'F. Scott Fitzgerald',
        publishedYear: 1925,
      };

      const response = await request(app.getHttpServer())
        .post('/api/books')
        .send(invalidCreateBookDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toStrictEqual(`"title" is required`);
    });

    it('should return validation error for missing author', async () => {
      const invalidCreateBookDto: Partial<CreateBookDto> = {
        title: 'The Great Gatsby',
        publishedYear: 1925,
      };

      const response = await request(app.getHttpServer())
        .post('/api/books')
        .send(invalidCreateBookDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toStrictEqual(`"author" is required`);
    });

    it('should return validation error for invalid publishedYear', async () => {
      const invalidCreateBookDto: Partial<CreateBookDto> = {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        publishedYear: 999, // Invalid year
      };

      const response = await request(app.getHttpServer())
        .post('/api/books')
        .send(invalidCreateBookDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toStrictEqual(
        `"publishedYear" must be greater than or equal to 1000`,
      );
    });

    it('should return validation error for missing publishedYear', async () => {
      const invalidCreateBookDto: Partial<CreateBookDto> = {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
      };

      const response = await request(app.getHttpServer())
        .post('/api/books')
        .send(invalidCreateBookDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toStrictEqual(
        `"publishedYear" is required`,
      );
    });

    it('should return validation error for all missing fields', async () => {
      const invalidCreateBookDto: Partial<CreateBookDto> = {};

      const response = await request(app.getHttpServer())
        .post('/api/books')
        .send(invalidCreateBookDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toStrictEqual(`"title" is required`);
    });
  });

  describe('GET /api/books', () => {
    it('should return all books', async () => {
      const books: Book[] = [
        {
          id: uuid(),
          title: 'The Great Gatsby',
          author: 'F. Scott Fitzgerald',
          publishedYear: 1925,
        },
        {
          id: uuid(),
          publishedYear: 2020,
          title: 'The Last Odyssey',
          author: 'James Rollins',
        },
      ];
      jest.spyOn(booksService, 'findAll').mockResolvedValueOnce(books);

      const response = await request(app.getHttpServer())
        .get('/api/books')
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(books);
    });
  });

  describe('GET /api/books/:id', () => {
    it('should return a book by id', async () => {
      const book: Book = {
        id: uuid(),
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        publishedYear: 1925,
      };

      jest.spyOn(booksService, 'findOne').mockResolvedValueOnce(book);

      const response = await request(app.getHttpServer())
        .get(`/api/books/${book.id}`)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(book);
    });
  });

  describe('PATCH /api/books/:id', () => {
    beforeEach(() => {
      jest.spyOn(booksService, 'update').mockResolvedValueOnce();
    });

    it('should update a book when valid data is provided', async () => {
      const book: Book = {
        id: uuid(),
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        publishedYear: 1925,
      };

      const updateBookDto: Partial<CreateBookDto> = {
        title: 'The Last Odyssey',
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/books/${book.id}`)
        .send(updateBookDto)
        .expect(HttpStatus.NO_CONTENT);

      expect(response.body).toEqual({});
      expect(booksService.update).toHaveBeenCalledWith(book.id, updateBookDto);
    });

    const fields = [
      ['title', 'The Last Odyssey'],
      ['author', 'James Rollins'],
      ['publishedYear', 2020],
    ];

    test.each(fields)(
      'should update a book when %p is missing',
      async (field, value) => {
        const book: Book = {
          id: uuid(),
          title: 'The Great Gatsby',
          author: 'F. Scott Fitzgerald',
          publishedYear: 1925,
        };

        const updateBookDto: Partial<CreateBookDto> = {
          [field]: value,
        };

        const response = await request(app.getHttpServer())
          .patch(`/api/books/${book.id}`)
          .send(updateBookDto)
          .expect(HttpStatus.NO_CONTENT);

        expect(response.body).toEqual({});
        expect(booksService.update).toHaveBeenCalledWith(
          book.id,
          updateBookDto,
        );
      },
    );

    it('should throw an error when all fields are missing', async () => {
      const book: Book = {
        id: uuid(),
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        publishedYear: 1925,
      };

      const updateBookDto: Partial<CreateBookDto> = {};

      const response = await request(app.getHttpServer())
        .patch(`/api/books/${book.id}`)
        .send(updateBookDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toStrictEqual(
        `\"value\" must contain at least one of [title, author, publishedYear]`,
      );
      expect(booksService.update).not.toHaveBeenCalled();
    });

    it('should throw an error when publishedYear is less than 1000', async () => {
      const book: Book = {
        id: uuid(),
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        publishedYear: 1925,
      };

      const updateBookDto: Partial<CreateBookDto> = {
        publishedYear: 999,
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/books/${book.id}`)
        .send(updateBookDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toStrictEqual(
        `\"publishedYear\" must be greater than or equal to 1000`,
      );

      expect(booksService.update).not.toHaveBeenCalled();
    });

    it('should throw an error when publishedYear is in the future', async () => {
      const book: Book = {
        id: uuid(),
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        publishedYear: 1925,
      };

      const updateBookDto: Partial<CreateBookDto> = {
        publishedYear: new Date().getFullYear() + 1,
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/books/${book.id}`)
        .send(updateBookDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toStrictEqual(
        `\"publishedYear\" must be less than or equal to ${new Date().getFullYear()}`,
      );
      expect(booksService.update).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /api/books/:id', () => {
    it('should delete a book by id', async () => {
      const book: Book = {
        id: uuid(),
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        publishedYear: 1925,
      };

      jest.spyOn(booksService, 'remove').mockResolvedValueOnce();

      const response = await request(app.getHttpServer())
        .delete(`/api/books/${book.id}`)
        .expect(HttpStatus.NO_CONTENT);

      expect(response.body).toEqual({});
      expect(booksService.remove).toHaveBeenCalledWith(book.id);
    });

    it('should throw an error when book is not found', async () => {
      const id = uuid();

      jest
        .spyOn(booksService, 'remove')
        .mockRejectedValueOnce(
          new NotFoundException(`Book with id:${id} not found`),
        );

      const response = await request(app.getHttpServer())
        .delete(`/api/books/${id}`)
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toStrictEqual(
        `Book with id:${id} not found`,
      );
      expect(booksService.remove).toHaveBeenCalledWith(id);
    });
  });
});

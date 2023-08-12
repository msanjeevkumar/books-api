import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from './books.service';
import { Sequelize } from 'sequelize-typescript';
import { CreateBookDto } from './dto/create-book.dto';
import { QueryTypes } from 'sequelize';
import { uuid } from 'uuidv4';
import { Book } from './entities/book.entity';
import { NotFoundException } from '@nestjs/common';
import { UpdateBookDto } from './dto/update-book.dto';
import { SqlQuery } from './sql-query.enum';
jest.mock('uuidv4');

describe('BooksService', () => {
  let booksService: BooksService;
  let sequelizeMock: any;

  beforeEach(async () => {
    sequelizeMock = {
      query: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        { provide: Sequelize, useValue: sequelizeMock },
      ],
    }).compile();

    booksService = module.get<BooksService>(BooksService);
  });

  describe('create', () => {
    const createBookDto: CreateBookDto = {
      title: 'Test Book',
      author: 'Test Author',
      publishedYear: 2023,
    };
    const mockUuid = 'generated-id';

    beforeEach(() => {
      (uuid as jest.Mock).mockReturnValue(mockUuid);
    });

    it('should create a book and return it', async () => {
      // Arrange
      sequelizeMock.query.mockResolvedValueOnce([]);

      // Act
      const result = await booksService.create(createBookDto);

      // Assert
      expect(result).toMatchSnapshot(); // Use inline snapshot
      expect(sequelizeMock.query).toHaveBeenCalledWith(
        SqlQuery.InsertBook,
        expect.objectContaining({
          type: QueryTypes.INSERT,
          replacements: {
            id: mockUuid,
            ...createBookDto,
          },
        }),
      );
    });

    it('should handle errors during creation', async () => {
      // Arrange
      const errorMessage = 'Failed to insert';
      sequelizeMock.query.mockRejectedValueOnce(new Error(errorMessage));

      // Act & Assert
      await expect(booksService.create(createBookDto)).rejects.toThrowError(
        errorMessage,
      );
      expect(sequelizeMock.query).toHaveBeenCalledWith(
        SqlQuery.InsertBook,
        expect.objectContaining({
          type: QueryTypes.INSERT,
          replacements: {
            ...createBookDto,
            id: mockUuid,
          },
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of books', async () => {
      // Arrange
      const expectedBooks: Book[] = [
        {
          id: 'ede9fa21-9fd0-4e7d-8e80-a39f3dcdbe7c',
          title: 'Book 1',
          author: 'Author 1',
          publishedYear: 2020,
        },
        {
          id: 'e6ad7085-4967-4e11-be20-e4d1e6c5d716',
          title: 'Book 2',
          author: 'Author 2',
          publishedYear: 2021,
        },
      ];
      sequelizeMock.query.mockResolvedValue(expectedBooks);

      // Act
      const result = await booksService.findAll();

      // Assert
      expect(result).toEqual(expectedBooks);
      expect(sequelizeMock.query).toHaveBeenCalledWith(
        SqlQuery.SelectAllBooks,
        expect.objectContaining({
          type: QueryTypes.SELECT,
        }),
      );
    });

    it('should handle empty result and return an empty array', async () => {
      // Arrange
      sequelizeMock.query.mockResolvedValue([]);

      // Act
      const result = await booksService.findAll();

      // Assert
      expect(result).toEqual([]);
      expect(sequelizeMock.query).toHaveBeenCalledWith(
        SqlQuery.SelectAllBooks,
        expect.objectContaining({
          type: QueryTypes.SELECT,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should find and return a book by id', async () => {
      // Arrange
      const bookId = 'valid-book-id';
      const expectedBook: Book = {
        id: bookId,
        title: 'Sample Book',
        author: 'John Doe',
        publishedYear: 2023,
      };
      sequelizeMock.query.mockResolvedValue(expectedBook);

      // Act
      const result = await booksService.findOne(bookId);

      // Assert
      expect(result).toEqual(expectedBook);
      expect(sequelizeMock.query).toHaveBeenCalledWith(
        SqlQuery.SelectBookById,
        {
          type: QueryTypes.SELECT,
          replacements: { id: bookId },
          plain: true,
        },
      );
    });

    it('should throw NotFoundException if book is not found', async () => {
      // Arrange
      const bookId = 'non-existent-book-id';
      sequelizeMock.query.mockResolvedValue(null);

      // Act and Assert
      await expect(booksService.findOne(bookId)).rejects.toThrowError(
        NotFoundException,
      );

      expect(sequelizeMock.query).toHaveBeenCalledWith(
        SqlQuery.SelectBookById,
        {
          type: QueryTypes.SELECT,
          replacements: { id: bookId },
          plain: true,
        },
      );
    });
  });

  describe('update', () => {
    it('should not update if the new values are the same as existing values of the book', async () => {
      // Arrange
      const id = 'book-id';
      const updateBookDto: UpdateBookDto = {
        title: 'Old Title',
        author: 'Author',
        publishedYear: 2020,
      };
      const existingBook: Book = {
        id,
        title: 'Old Title',
        author: 'Author',
        publishedYear: 2020,
      };
      sequelizeMock.query.mockResolvedValueOnce(existingBook);

      // Act
      const result = await booksService.update(id, updateBookDto);

      // Assert
      expect(result).toBeUndefined();
      expect(sequelizeMock.query).toHaveBeenCalledTimes(1);
      expect(sequelizeMock.query).toHaveBeenCalledWith(
        SqlQuery.SelectBookById,
        {
          type: QueryTypes.SELECT,
          replacements: { id },
          plain: true,
        },
      );
    });

    it('should throw NotFoundException if the book is not found', async () => {
      // Arrange
      const id = 'non-existent-id';
      const updateBookDto: UpdateBookDto = { title: 'New Title' };
      sequelizeMock.query.mockResolvedValue(null);

      // Act and Assert
      await expect(booksService.update(id, updateBookDto)).rejects.toThrowError(
        NotFoundException,
      );

      expect(sequelizeMock.query).toHaveBeenCalledTimes(1);
      expect(sequelizeMock.query).toHaveBeenCalledWith(
        SqlQuery.SelectBookById,
        {
          type: QueryTypes.SELECT,
          replacements: { id },
          plain: true,
        },
      );
    });

    it('should update the specified fields', async () => {
      // Arrange
      const updateBookDto: UpdateBookDto = {
        title: 'Updated Title',
        author: 'Updated Author',
      };
      const existingBook: Book = {
        id: 'existing-id',
        title: 'Existing Book',
        author: 'Existing Author',
        publishedYear: 2020,
      };
      const expectedQuery = `UPDATE books_db.books SET title = :title, author = :author WHERE id = :id`;
      const expectedReplacements = {
        id: existingBook.id,
        ...updateBookDto,
      };
      sequelizeMock.query.mockResolvedValueOnce(existingBook);
      sequelizeMock.query.mockResolvedValueOnce({ affectedRows: 1 });

      // Act
      await booksService.update(existingBook.id, updateBookDto);

      // Assert
      expect(sequelizeMock.query).toHaveBeenNthCalledWith(
        1,
        SqlQuery.SelectBookById,
        {
          type: QueryTypes.SELECT,
          replacements: { id: existingBook.id },
          plain: true,
        },
      );
      expect(sequelizeMock.query).toHaveBeenNthCalledWith(2, expectedQuery, {
        type: QueryTypes.UPDATE,
        replacements: expectedReplacements,
      });
    });
  });

  describe('remove', () => {
    it('should remove a book', async () => {
      // Arrange
      const id = 'test-id';
      const affectedRows = 1;
      const mockQueryResult = [[], { affectedRows }];
      sequelizeMock.query.mockResolvedValueOnce(mockQueryResult);

      // Act
      await booksService.remove(id);

      // Assert
      expect(sequelizeMock.query).toHaveBeenCalledWith(SqlQuery.DeleteBook, {
        type: QueryTypes.RAW,
        replacements: { id },
      });
    });

    it('should throw NotFoundException if book is not found', async () => {
      // Arrange
      const id = 'test-id';
      const affectedRows = 0;
      const mockQueryResult = [[], { affectedRows }];
      sequelizeMock.query.mockResolvedValueOnce(mockQueryResult);

      // Act and Assert
      await expect(booksService.remove(id)).rejects.toThrowError(
        NotFoundException,
      );
      expect(sequelizeMock.query).toHaveBeenCalledWith(SqlQuery.DeleteBook, {
        type: QueryTypes.RAW,
        replacements: { id },
      });
    });

    it('should handle database error', async () => {
      // Arrange
      const id = 'test-id';
      const errorMessage = 'Database error';
      sequelizeMock.query.mockRejectedValueOnce(new Error(errorMessage));

      // Act and Assert
      await expect(booksService.remove(id)).rejects.toThrowError(errorMessage);
      expect(sequelizeMock.query).toHaveBeenCalledWith(SqlQuery.DeleteBook, {
        type: QueryTypes.RAW,
        replacements: { id },
      });
    });
  });
});

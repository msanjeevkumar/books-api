import { RunnableMigration } from 'umzug';
import { QueryInterface } from 'sequelize';
import { uuid } from 'uuidv4';

const migration: Pick<RunnableMigration<QueryInterface>, 'up' | 'down'> = {
  up: async ({ context: queryInterface }) => {
    const booksData = [
      {
        id: uuid(),
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        publishedYear: 1960,
      },
      {
        id: uuid(),
        title: '1984',
        author: 'George Orwell',
        publishedYear: 1949,
      },
      {
        id: uuid(),
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        publishedYear: 1925,
      },
      {
        id: uuid(),
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
        publishedYear: 1813,
      },
      {
        id: uuid(),
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        publishedYear: 1960,
      },
      {
        id: uuid(),
        title: 'The Catcher in the Rye',
        author: 'J.D. Salinger',
        publishedYear: 1951,
      },
      {
        id: uuid(),
        title: "Harry Potter and the Sorcerer's Stone",
        author: 'J.K. Rowling',
        publishedYear: 1997,
      },
      {
        id: uuid(),
        title: 'The Lord of the Rings',
        author: 'J.R.R. Tolkien',
        publishedYear: 1954,
      },
      {
        id: uuid(),
        title: 'The Hobbit',
        author: 'J.R.R. Tolkien',
        publishedYear: 1937,
      },
      {
        id: uuid(),
        title: 'The Chronicles of Narnia',
        author: 'C.S. Lewis',
        publishedYear: 1950,
      },
    ];

    for (const book of booksData) {
      await queryInterface.sequelize.query(
        `
        INSERT INTO books (id, title, author, publishedYear)
        VALUES (:id, :title, :author, :publishedYear)
      `,
        { replacements: book },
      );
    }
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.query(`DELETE FROM books`);
  },
};

export = migration;

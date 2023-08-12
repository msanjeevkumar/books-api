import { RunnableMigration } from 'umzug';
import { QueryInterface } from 'sequelize';

const migration: Pick<RunnableMigration<QueryInterface>, 'up' | 'down'> = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.query(`
          CREATE TABLE books (
            id VARCHAR(36) PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            author VARCHAR(255) NOT NULL,
            publishedYear INT NOT NULL
          )
        `);
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS books`);
  },
};

export = migration;

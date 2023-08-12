export enum SqlQuery {
  InsertBook = 'INSERT INTO books_db.books (id, title, author, publishedYear) VALUES (:id, :title, :author, :publishedYear)',
  SelectAllBooks = 'SELECT * FROM books_db.books',
  SelectBookById = 'SELECT * FROM books_db.books WHERE id = :id',
  UpdateBook = 'UPDATE books_db.books SET {fields} WHERE id = :id',
  DeleteBook = 'DELETE FROM books_db.books WHERE id = :id',
}

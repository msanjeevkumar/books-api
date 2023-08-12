# Node.js and TypeScript RESTful API Project

This repository contains a RESTful API project built using Node.js and TypeScript. The API is designed to manage a collection of books and includes endpoints for retrieving, adding, updating, and deleting books. The project also incorporates Swagger support, input validation using Joi, unit tests, and uses Sequelize with raw queries to interact with a MySQL database.

## Table of Contents

- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Validation and Error Handling](#validation-and-error-handling)
- [Testing](#testing)
- [Dockerization](#dockerization)
- [Installation](#installation)
- [Usage](#usage)
- [License](#license)

## Getting Started

To get started with this project, follow the instructions below:

1. Clone this repository to your local machine.
2. Install the required dependencies using `npm install`.
3. Set up your MySQL database and configure the database connection in the `.env` file.
4. Run database migrations using `npm run migrate` to set up the necessary tables.
5. Start the application using `npm run start`.

## API Endpoints

The following endpoints are available in the API:

- `GET /api/books`: Retrieve a list of all books.
- `GET /api/books/:id`: Retrieve a specific book by its ID.
- `POST /api/books`: Add a new book to the collection.
- `PUT /api/books/:id`: Update an existing book by its ID.
- `DELETE /api/books/:id`: Delete a book from the collection by its ID.

## Validation and Error Handling

Input validation is implemented for various endpoints to ensure data integrity. The API uses Joi for input validation and returns appropriate error responses for invalid input or when a book is not found.

## Testing

The project includes a comprehensive suite of unit tests to ensure the correctness of the API endpoints and their functionality. To run the tests, use the command `npm run test`.

## Dockerization

This project is containerized using Docker. A Dockerfile is included in the repository to build the Docker image. To build and run the Docker container, follow these steps:

1. Build the Docker image: `docker build -t node-api .`
2. Run the Docker container: `docker run -p 3000:3000 node-api`

## Installation

1. Clone the repository: `git clone https://github.com/msanjeevkumar/books-api.git`
2. Install dependencies: `npm install`

## Usage

1. Configure the database connection in `.env`.
2. Run database migrations: `npm run migrate`
3. Start the application: `npm run start`


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Feel free to reach out if you have any questions or need further clarification. Good luck with your portfolio!

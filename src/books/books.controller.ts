import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Book } from './entities/book.entity';

@Controller('api/books')
@ApiTags('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @ApiCreatedResponse({ description: 'Book created successfully' })
  async create(@Body() createBookDto: CreateBookDto) {
    return this.booksService.create(createBookDto);
  }

  @Get()
  @ApiOkResponse({ type: [Book] })
  async findAll() {
    return this.booksService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: Book })
  @ApiNotFoundResponse({
    description: 'Book not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Book with id:d170d408-6330-448b-9461-a55696fe4d69 not found',
        error: 'Not Found',
      },
    },
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'unique identifier of the book',
    example: 'd170d408-6330-448b-9461-a55696fe4d69',
  })
  async findOne(@Param('id') id: string) {
    return this.booksService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(204)
  @ApiNoContentResponse({ description: 'Book updated successfully' })
  @ApiNotFoundResponse({
    description: 'Book not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Book with id:d170d408-6330-448b-9461-a55696fe4d69 not found',
        error: 'Not Found',
      },
    },
  })
  async update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.booksService.update(id, updateBookDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiNoContentResponse({ description: 'Book deleted successfully' })
  @ApiNotFoundResponse({
    description: 'Book not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Book with id:d170d408-6330-448b-9461-a55696fe4d69 not found',
        error: 'Not Found',
      },
    },
  })
  async remove(@Param('id') id: string) {
    return this.booksService.remove(id);
  }
}

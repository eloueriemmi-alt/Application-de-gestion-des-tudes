import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe } from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  create(@Body(new ValidationPipe({ 
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: false,
  })) createStudentDto: CreateStudentDto) {
    console.log('Données reçues:', createStudentDto);
    return this.studentsService.create(createStudentDto);
  }

  @Get()
  findAll() {
    return this.studentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body(new ValidationPipe({ 
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: false,
  })) updateStudentDto: UpdateStudentDto) {
    console.log('Données reçues pour update:', updateStudentDto);
    return this.studentsService.update(+id, updateStudentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentsService.remove(+id);
  }
}
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
  ) {}

 async create(createStudentDto: CreateStudentDto): Promise<Student> {
  console.log('Service create() - DTO reçu:', createStudentDto);
  
  const student = new Student();
  student.nom = createStudentDto.nom;
  student.prenom = createStudentDto.prenom;
  student.email = createStudentDto.email || null;
  student.telephone = createStudentDto.telephone || null;
  student.dateNaissance = createStudentDto.dateNaissance || null;
  student.adresse = createStudentDto.adresse || null;
  student.niveau = createStudentDto.niveau || null;
  student.statut = createStudentDto.statut || 'actif';
  student.nomParent = createStudentDto.nomParent || null;
  student.prenomParent = createStudentDto.prenomParent || null;
  student.telephoneParent = createStudentDto.telephoneParent || null;
  student.emailParent = createStudentDto.emailParent || null;

  console.log('Service create() - Student à sauvegarder:', student);
  
  return this.studentsRepository.save(student);
}

  async findAll(): Promise<Student[]> {
    return this.studentsRepository.find({
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: number): Promise<Student> {
    const student = await this.studentsRepository.findOne({ where: { id } });
    if (!student) {
      throw new NotFoundException(`Élève avec l'ID ${id} non trouvé`);
    }
    return student;
  }

  async update(id: number, updateStudentDto: UpdateStudentDto): Promise<Student> {
    const student = await this.findOne(id);
    Object.assign(student, updateStudentDto);
    return this.studentsRepository.save(student);
  }

  async remove(id: number): Promise<void> {
    const student = await this.findOne(id);
    await this.studentsRepository.remove(student);
  }
}
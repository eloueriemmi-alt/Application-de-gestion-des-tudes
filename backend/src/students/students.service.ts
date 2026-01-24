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

async create(createStudentDto: any): Promise<Student> {
  console.log('===== SERVICE CREATE =====');
  console.log('DTO reçu:', JSON.stringify(createStudentDto));
  
  // Vérifier que nom et prenom ne sont pas vides
  if (!createStudentDto.nom || !createStudentDto.prenom) {
    throw new Error('Nom et prénom sont obligatoires');
  }

  const studentData = {
    nom: String(createStudentDto.nom).trim(),
    prenom: String(createStudentDto.prenom).trim(),
    email: createStudentDto.email ? String(createStudentDto.email).trim() : null,
    telephone: createStudentDto.telephone ? String(createStudentDto.telephone).trim() : null,
    dateNaissance: createStudentDto.dateNaissance ? String(createStudentDto.dateNaissance).trim() : null,
    adresse: createStudentDto.adresse ? String(createStudentDto.adresse).trim() : null,
    niveau: createStudentDto.niveau ? String(createStudentDto.niveau).trim() : null,
    statut: createStudentDto.statut ? String(createStudentDto.statut).trim() : 'actif',
    nomParent: createStudentDto.nomParent ? String(createStudentDto.nomParent).trim() : null,
    prenomParent: createStudentDto.prenomParent ? String(createStudentDto.prenomParent).trim() : null,
    telephoneParent: createStudentDto.telephoneParent ? String(createStudentDto.telephoneParent).trim() : null,
    emailParent: createStudentDto.emailParent ? String(createStudentDto.emailParent).trim() : null,
  };

  console.log('Data à créer:', JSON.stringify(studentData));

  const student = this.studentsRepository.create(studentData);
  console.log('Student créé:', student);

  const saved = await this.studentsRepository.save(student);
  console.log('Student sauvegardé:', saved);
  
  return saved;
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
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Group } from './entities/group.entity';
import { Student } from '../students/entities/student.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private groupsRepository: Repository<Group>,
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
  ) {}

  async create(createGroupDto: CreateGroupDto): Promise<Group> {
    const { studentIds, ...groupData } = createGroupDto;
    
    const group = this.groupsRepository.create(groupData);
    
    if (studentIds && studentIds.length > 0) {
      group.students = await this.studentsRepository.findBy({
        id: In(studentIds)
      });
    }
    
    return this.groupsRepository.save(group);
  }

  async findAll(): Promise<Group[]> {
    return this.groupsRepository.find({
      relations: ['students'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: number): Promise<Group> {
    const group = await this.groupsRepository.findOne({
      where: { id },
      relations: ['students']
    });
    
    if (!group) {
      throw new NotFoundException(`Groupe avec l'ID ${id} non trouvé`);
    }
    
    return group;
  }

  async update(id: number, updateGroupDto: UpdateGroupDto): Promise<Group> {
    const group = await this.findOne(id);
    const { studentIds, ...groupData } = updateGroupDto;
    
    Object.assign(group, groupData);
    
    if (studentIds !== undefined) {
      if (studentIds.length > 0) {
        group.students = await this.studentsRepository.findBy({
          id: In(studentIds)
        });
      } else {
        group.students = [];
      }
    }
    
    return this.groupsRepository.save(group);
  }

  async remove(id: number): Promise<void> {
    const group = await this.findOne(id);
    await this.groupsRepository.remove(group);
  }

  async addStudents(groupId: number, studentIds: number[]): Promise<Group> {
    const group = await this.findOne(groupId);
    const students = await this.studentsRepository.findBy({
      id: In(studentIds)
    });
    
    group.students = [...group.students, ...students];
    return this.groupsRepository.save(group);
  }

  async removeStudent(groupId: number, studentId: number): Promise<Group> {
    const group = await this.findOne(groupId);
    group.students = group.students.filter(s => s.id !== studentId);
    return this.groupsRepository.save(group);
  }
}
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { Student } from '../students/entities/student.entity';
import { Group } from '../groups/entities/group.entity';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    @InjectRepository(Group)
    private groupsRepository: Repository<Group>,
  ) {}

  async create(createAttendanceDto: CreateAttendanceDto): Promise<Attendance> {
    const attendance = this.attendanceRepository.create(createAttendanceDto);
    return this.attendanceRepository.save(attendance);
  }

  async markAttendanceForSession(markAttendanceDto: MarkAttendanceDto): Promise<Attendance[]> {
    const { dateSeance, group_id, attendances } = markAttendanceDto;

    // Supprimer les anciennes présences pour cette date et ce groupe
    await this.attendanceRepository.delete({
      dateSeance,
      group_id,
    });

    // Créer les nouvelles présences
    const attendanceRecords = attendances.map(att => 
      this.attendanceRepository.create({
        dateSeance,
        group_id,
        student_id: att.student_id,
        statut: att.statut,
        notes: att.notes,
      })
    );

    return this.attendanceRepository.save(attendanceRecords);
  }

  async findAll(): Promise<Attendance[]> {
    return this.attendanceRepository.find({
      relations: ['student', 'group'],
      order: { dateSeance: 'DESC', createdAt: 'DESC' }
    });
  }

  async findByGroup(groupId: number): Promise<Attendance[]> {
    return this.attendanceRepository.find({
      where: { group_id: groupId },
      relations: ['student', 'group'],
      order: { dateSeance: 'DESC' }
    });
  }

  async findByStudent(studentId: number): Promise<Attendance[]> {
    return this.attendanceRepository.find({
      where: { student_id: studentId },
      relations: ['student', 'group'],
      order: { dateSeance: 'DESC' }
    });
  }

  async findByDate(date: string): Promise<Attendance[]> {
    return this.attendanceRepository.find({
      where: { dateSeance: date },
      relations: ['student', 'group'],
    });
  }

  async findByGroupAndDate(groupId: number, date: string): Promise<Attendance[]> {
    return this.attendanceRepository.find({
      where: { 
        group_id: groupId,
        dateSeance: date 
      },
      relations: ['student', 'group'],
    });
  }

  async findOne(id: number): Promise<Attendance> {
    const attendance = await this.attendanceRepository.findOne({
      where: { id },
      relations: ['student', 'group']
    });

    if (!attendance) {
      throw new NotFoundException(`Présence avec l'ID ${id} non trouvée`);
    }

    return attendance;
  }

  async update(id: number, updateAttendanceDto: UpdateAttendanceDto): Promise<Attendance> {
    const attendance = await this.findOne(id);
    Object.assign(attendance, updateAttendanceDto);
    return this.attendanceRepository.save(attendance);
  }

  async remove(id: number): Promise<void> {
    const attendance = await this.findOne(id);
    await this.attendanceRepository.remove(attendance);
  }

  async getStatistics(groupId?: number, studentId?: number): Promise<any> {
    let query = this.attendanceRepository.createQueryBuilder('attendance');

    if (groupId) {
      query = query.where('attendance.group_id = :groupId', { groupId });
    }

    if (studentId) {
      query = query.where('attendance.student_id = :studentId', { studentId });
    }

    const attendances = await query.getMany();

    const present = attendances.filter(a => a.statut === 'présent').length;
    const absent = attendances.filter(a => a.statut === 'absent').length;
    const retard = attendances.filter(a => a.statut === 'retard').length;
    const total = attendances.length;

    return {
      total,
      present,
      absent,
      retard,
      tauxPresence: total > 0 ? ((present / total) * 100).toFixed(2) : 0,
    };
  }
}
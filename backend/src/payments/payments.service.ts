import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { Student } from '../students/entities/student.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
  ) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const student = await this.studentsRepository.findOne({
      where: { id: createPaymentDto.student_id }
    });

    if (!student) {
      throw new NotFoundException(`Élève avec l'ID ${createPaymentDto.student_id} non trouvé`);
    }

    const payment = this.paymentsRepository.create(createPaymentDto);
    return this.paymentsRepository.save(payment);
  }

  async findAll(): Promise<Payment[]> {
    return this.paymentsRepository.find({
      relations: ['student'],
      order: { createdAt: 'DESC' }
    });
  }

  async findByStudent(studentId: number): Promise<Payment[]> {
    return this.paymentsRepository.find({
      where: { student_id: studentId },
      relations: ['student'],
      order: { datePayement: 'DESC' }
    });
  }

  async findOne(id: number): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({
      where: { id },
      relations: ['student']
    });

    if (!payment) {
      throw new NotFoundException(`Paiement avec l'ID ${id} non trouvé`);
    }

    return payment;
  }

  async update(id: number, updatePaymentDto: UpdatePaymentDto): Promise<Payment> {
    const payment = await this.findOne(id);
    Object.assign(payment, updatePaymentDto);
    return this.paymentsRepository.save(payment);
  }

  async remove(id: number): Promise<void> {
    const payment = await this.findOne(id);
    await this.paymentsRepository.remove(payment);
  }

  async getStatistics(): Promise<any> {
    const payments = await this.paymentsRepository.find({
      where: { statut: 'payé' }
    });

    const totalPayments = payments.reduce((sum, p) => sum + Number(p.montant), 0);
    const paymentsThisMonth = payments.filter(p => {
      const paymentDate = new Date(p.datePayement);
      const now = new Date();
      return paymentDate.getMonth() === now.getMonth() && 
             paymentDate.getFullYear() === now.getFullYear();
    });

    const totalThisMonth = paymentsThisMonth.reduce((sum, p) => sum + Number(p.montant), 0);

    return {
      totalPayments,
      totalThisMonth,
      paymentsCount: payments.length,
      paymentsThisMonthCount: paymentsThisMonth.length
    };
  }
}
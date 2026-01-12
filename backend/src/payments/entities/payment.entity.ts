import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Student } from '../../students/entities/student.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 10, scale: 2 })
  montant: number;

  @Column({ nullable: true })
  mois: string; // Ex: "Janvier 2026"

  @Column()
  datePayement: string;

  @Column({ nullable: true })
  methodePaiement: string; // Ex: "Espèces", "Virement", "Chèque"

  @Column({ default: 'payé' })
  statut: string; // payé, en attente, annulé

  @Column({ nullable: true })
  notes: string;

  // Nouvelles colonnes pour les séances
  @Column({ type: 'int', default: 4 })
  nombreSeances: number; // Nombre de séances payées

  @Column({ type: 'simple-array', nullable: true })
  datesSeances: string[]; // Liste des dates de séances (ex: ["2026-01-10", "2026-01-17", "2026-01-24", "2026-01-31"])

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  prixParSeance: number; // Prix unitaire par séance

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column()
  student_id: number;

  @CreateDateColumn()
  createdAt: Date;
}
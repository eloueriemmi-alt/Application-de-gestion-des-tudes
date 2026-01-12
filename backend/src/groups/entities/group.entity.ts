import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { Student } from '../../students/entities/student.entity';

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  niveau: string;

  @Column({ nullable: true })
  anneeAcademique: string;

  @Column({ default: 'actif' })
  statut: string;

  // Informations des séances
  @Column({ nullable: true })
  lieu: string;

  @Column({ nullable: true })
  jourSeance: string; // Ex: "Lundi", "Mercredi"

  @Column({ nullable: true })
  heureDebut: string; // Ex: "14:00"

  @Column({ nullable: true })
  heureFin: string; // Ex: "16:00"

  @ManyToMany(() => Student)
  @JoinTable({
    name: 'group_students',
    joinColumn: { name: 'group_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'student_id', referencedColumnName: 'id' }
  })
  students: Student[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
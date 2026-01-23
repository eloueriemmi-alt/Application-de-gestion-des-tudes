import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column()
  prenom: string;

  @Column({ nullable: true })
  email: string | null;

  @Column({ nullable: true })
  telephone: string | null;

  @Column({ nullable: true })
  dateNaissance: string | null;

  @Column({ nullable: true })
  adresse: string | null;

  @Column({ nullable: true })
  niveau: string | null;

  @Column({ default: 'actif' })
  statut: string;

  @Column({ nullable: true })
  nomParent: string | null;

  @Column({ nullable: true })
  prenomParent: string | null;

  @Column({ nullable: true })
  telephoneParent: string | null;

  @Column({ nullable: true })
  emailParent: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  updatedAt: Date | null;
}
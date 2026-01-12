import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column()
  prenom: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  telephone: string;

  @Column({ nullable: true })
  dateNaissance: string;

  @Column({ nullable: true })
  adresse: string;

  @Column({ nullable: true })
  niveau: string;

  @Column({ default: 'actif' })
  statut: string;

 

   // Informations Parent
  @Column({ nullable: true })
  nomParent: string;

  @Column({ nullable: true })
  prenomParent: string;

  @Column({ nullable: true })
  telephoneParent: string;

  @Column({ nullable: true })
  emailParent: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
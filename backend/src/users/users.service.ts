import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findAll() {
    return this.usersRepository.find({
      select: ['id', 'email', 'nom', 'prenom', 'role', 'createdAt'],
      order: { createdAt: 'DESC' }
    });
  }

  async updateRole(id: number, role: string) {
    await this.usersRepository.update(id, { role });
    return { message: 'Rôle mis à jour avec succès' };
  }

  async remove(id: number) {
    await this.usersRepository.delete(id);
    return { message: 'Utilisateur supprimé avec succès' };
  }
}
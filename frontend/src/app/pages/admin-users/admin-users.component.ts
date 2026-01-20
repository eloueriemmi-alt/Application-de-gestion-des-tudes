import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UsersService } from '../../services/users.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-users',
  imports: [CommonModule],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css',
})
export class AdminUsersComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  isLoading = false;
  currentUser: any = null;

  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user?.role !== 'superadmin') {
        alert('Accès refusé. Vous devez être SuperAdmin.');
        this.router.navigate(['/dashboard']);
      }
    });

    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    this.usersService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = users;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.isLoading = false;
        alert('Erreur lors du chargement des utilisateurs');
      }
    });
  }

  changeRole(userId: number, newRole: string) {
    if (confirm(`Confirmer le changement de rôle vers "${newRole}" ?`)) {
      this.usersService.updateUserRole(userId, newRole).subscribe({
        next: () => {
          alert('Rôle mis à jour avec succès');
          this.loadUsers();
        },
        error: (error) => {
          console.error('Erreur:', error);
          alert('Erreur lors de la mise à jour du rôle');
        }
      });
    }
  }

  deleteUser(userId: number, userEmail: string) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${userEmail} ?`)) {
      this.usersService.deleteUser(userId).subscribe({
        next: () => {
          alert('Utilisateur supprimé avec succès');
          this.loadUsers();
        },
        error: (error) => {
          console.error('Erreur:', error);
          alert('Erreur lors de la suppression');
        }
      });
    }
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
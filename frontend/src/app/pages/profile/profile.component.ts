import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  user: any = {
    nom: '',
    prenom: '',
    email: ''
  };
  
  isSaving = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.user = { ...user };
      }
    });
  }

  saveProfile() {
    if (!this.user.nom || !this.user.prenom || !this.user.email) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Note: Il faudrait créer une route API pour mettre à jour le profil
    // Pour l'instant, on met à jour localement
    localStorage.setItem('user', JSON.stringify(this.user));
    
    // Mettre à jour le BehaviorSubject
    this.authService['currentUserSubject'].next(this.user);

    setTimeout(() => {
      this.isSaving = false;
      this.successMessage = 'Profil mis à jour avec succès !';
      
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    }, 500);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
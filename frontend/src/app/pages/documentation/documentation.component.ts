import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-documentation',
  imports: [CommonModule],
  templateUrl: './documentation.component.html',
  styleUrl: './documentation.component.css',
})
export class DocumentationComponent {
  activeSection = 'introduction';

  sections = [
    { id: 'introduction', title: '📖 Introduction', icon: '📖' },
    { id: 'getting-started', title: '🚀 Démarrage', icon: '🚀' },
    { id: 'dashboard', title: '🏠 Dashboard', icon: '🏠' },
    { id: 'students', title: '👨‍🎓 Élèves', icon: '👨‍🎓' },
    { id: 'groups', title: '👥 Groupes', icon: '👥' },
    { id: 'payments', title: '💰 Paiements', icon: '💰' },
    { id: 'attendance', title: '📋 Présences', icon: '📋' },
    { id: 'statistics', title: '📊 Statistiques', icon: '📊' },
    { id: 'notifications', title: '🔔 Notifications', icon: '🔔' },
    { id: 'export', title: '📄 Exports', icon: '📄' },
    { id: 'profile', title: '👤 Profil', icon: '👤' },
    { id: 'tips', title: '💡 Astuces', icon: '💡' }
  ];

  constructor(private router: Router) {}

  scrollToSection(sectionId: string) {
    this.activeSection = sectionId;
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
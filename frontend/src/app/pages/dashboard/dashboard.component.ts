import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { StudentsService } from '../../services/students.service';
import { GroupsService } from '../../services/groups.service';
import { PaymentsService } from '../../services/payments.service';
import { NotificationBellComponent } from '../../components/notification-bell/notification-bell.component';
import { AlertCheckerService } from '../../services/alert-checker.service';
import { DocumentationComponent } from '../documentation/documentation.component';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, NotificationBellComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  user: any = null;
  studentsCount = 0;
  groupsCount = 0;
  totalPayments = 0;

  constructor(
    private authService: AuthService,
    private studentsService: StudentsService,
    private groupsService: GroupsService,
    private paymentsService: PaymentsService,
    private alertChecker: AlertCheckerService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
    
    // Charger les statistiques
    this.studentsService.getAll().subscribe({
      next: (students) => {
        this.studentsCount = students.length;
      }
    });
    
    this.groupsService.getAll().subscribe({
      next: (groups) => {
        this.groupsCount = groups.length;
      }
    });

    this.paymentsService.getStatistics().subscribe({
      next: (stats) => {
        this.totalPayments = stats.totalPayments;
      }
    });

     setTimeout(() => {
      this.alertChecker.checkAllAlerts();
    }, 2000);
  }

  goToStudents() {
    this.router.navigate(['/students']);
  }

  goToGroups() {
    this.router.navigate(['/groups']);
  }

  goToPayments() {
    this.router.navigate(['/payments']);
  }

  goToStatistics() {
    this.router.navigate(['/statistics']);
  }

  goToDocumentation() {
    this.router.navigate(['/documentation']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
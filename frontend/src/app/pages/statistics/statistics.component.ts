import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartData, ChartType, registerables } from 'chart.js';
import { PaymentsService } from '../../services/payments.service';
import { StudentsService } from '../../services/students.service';
import { AttendanceService } from '../../services/attendance.service';
import { AuthService } from '../../services/auth.service';

Chart.register(...registerables);

@Component({
  selector: 'app-statistics',
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.css',
})
export class StatisticsComponent implements OnInit {
  isLoading = false;
  
  // Stats globales
  totalStudents = 0;
  totalRevenue = 0;
  averageAttendanceRate = 0;
  totalPayments = 0;

  // Graphique Revenus par mois
  revenueChartData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Revenus (DT)',
      borderColor: '#667eea',
      backgroundColor: 'rgba(102, 126, 234, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  revenueChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true }
    }
  };

  // Graphique Répartition des paiements
  paymentMethodChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: ['#667eea', '#28a745', '#ffc107', '#dc3545']
    }]
  };

  paymentMethodChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  // Graphique Taux de présence
  attendanceChartData: ChartData<'doughnut'> = {
    labels: ['Présents', 'Absents', 'Retards'],
    datasets: [{
      data: [],
      backgroundColor: ['#28a745', '#dc3545', '#ffc107']
    }]
  };

  attendanceChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  // Graphique Évolution des élèves
  studentsChartData: ChartData<'bar'> = {
    labels: ['Actifs', 'Inactifs'],
    datasets: [{
      data: [],
      label: 'Nombre d\'élèves',
      backgroundColor: ['#667eea', '#e0e0e0']
    }]
  };

  studentsChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    }
  };

  constructor(
    private paymentsService: PaymentsService,
    private studentsService: StudentsService,
    private attendanceService: AttendanceService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadStatistics();
  }

  loadStatistics() {
    this.isLoading = true;
    
    // Charger toutes les données en parallèle
    Promise.all([
      this.loadPaymentsData(),
      this.loadStudentsData(),
      this.loadAttendanceData()
    ]).then(() => {
      this.isLoading = false;
    }).catch(error => {
      console.error('Erreur:', error);
      this.isLoading = false;
    });
  }

  loadPaymentsData() {
    return new Promise((resolve) => {
      this.paymentsService.getAll().subscribe({
        next: (payments) => {
          this.totalPayments = payments.length;
          this.totalRevenue = payments
            .filter(p => p.statut === 'payé')
            .reduce((sum, p) => sum + Number(p.montant), 0);

          // Revenus par mois
          const monthlyRevenue = this.calculateMonthlyRevenue(payments);
          this.revenueChartData.labels = monthlyRevenue.labels;
          this.revenueChartData.datasets[0].data = monthlyRevenue.data;

          // Répartition par méthode
          const methodDistribution = this.calculateMethodDistribution(payments);
          this.paymentMethodChartData.labels = methodDistribution.labels;
          this.paymentMethodChartData.datasets[0].data = methodDistribution.data;

          resolve(true);
        },
        error: (error) => {
          console.error('Erreur paiements:', error);
          resolve(false);
        }
      });
    });
  }

  loadStudentsData() {
    return new Promise((resolve) => {
      this.studentsService.getAll().subscribe({
        next: (students) => {
          this.totalStudents = students.length;
          
          const actifs = students.filter(s => s.statut === 'actif').length;
          const inactifs = students.filter(s => s.statut === 'inactif').length;
          
          this.studentsChartData.datasets[0].data = [actifs, inactifs];
          
          resolve(true);
        },
        error: (error) => {
          console.error('Erreur élèves:', error);
          resolve(false);
        }
      });
    });
  }

  loadAttendanceData() {
    return new Promise((resolve) => {
      this.attendanceService.getStatistics().subscribe({
        next: (stats) => {
          this.averageAttendanceRate = Number(stats.tauxPresence);
          
          this.attendanceChartData.datasets[0].data = [
            stats.present,
            stats.absent,
            stats.retard
          ];
          
          resolve(true);
        },
        error: (error) => {
          console.error('Erreur présences:', error);
          resolve(false);
        }
      });
    });
  }

  calculateMonthlyRevenue(payments: any[]) {
    const monthlyData: { [key: string]: number } = {};
    
    payments.filter(p => p.statut === 'payé').forEach(payment => {
      const month = payment.mois || 'Non défini';
      monthlyData[month] = (monthlyData[month] || 0) + Number(payment.montant);
    });

    return {
      labels: Object.keys(monthlyData),
      data: Object.values(monthlyData)
    };
  }

  calculateMethodDistribution(payments: any[]) {
    const methodData: { [key: string]: number } = {};
    
    payments.filter(p => p.statut === 'payé').forEach(payment => {
      const method = payment.methodePaiement || 'Non défini';
      methodData[method] = (methodData[method] || 0) + 1;
    });

    return {
      labels: Object.keys(methodData),
      data: Object.values(methodData)
    };
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
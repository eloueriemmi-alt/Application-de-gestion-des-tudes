import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PaymentsService, Payment } from '../../services/payments.service';
import { StudentsService, Student } from '../../services/students.service';
import { AuthService } from '../../services/auth.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-payments',
  imports: [CommonModule, FormsModule],
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.css',
})
export class PaymentsComponent implements OnInit {
  payments: Payment[] = [];
  students: Student[] = [];
  isLoading = false;
  showForm = false;
  editMode = false;
  currentPayment: Payment = this.getEmptyPayment();
  
  totalPayments = 0;
  totalThisMonth = 0;
   // Filtres et recherche
  filteredPayments: Payment[] = [];
  searchTerm = '';
  filterMois = '';
  filterStatut = '';
  filterMethode = '';
  moisList: string[] = [];
  
  // Exposer Number pour le template
      Number = Number;

  constructor(
    private paymentsService: PaymentsService,
    private studentsService: StudentsService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadPayments();
    this.loadStudents();
    this.loadStatistics();
  }

  loadPayments() {
    this.isLoading = true;
    this.paymentsService.getAll().subscribe({
      next: (data) => {
        this.payments = data;
        this.filteredPayments = data;
        this.extractMois();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.isLoading = false;
      }
    });
  }

  loadStudents() {
    this.studentsService.getAll().subscribe({
      next: (data) => {
        this.students = data;
      },
      error: (error) => {
        console.error('Erreur:', error);
      }
    });
  }

  loadStatistics() {
    this.paymentsService.getStatistics().subscribe({
      next: (stats) => {
        this.totalPayments = stats.totalPayments;
        this.totalThisMonth = stats.totalThisMonth;
      },
      error: (error) => {
        console.error('Erreur:', error);
      }
    });
  }

  getEmptyPayment(): Payment {
  const today = new Date().toISOString().split('T')[0];
  const currentMonth = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  
  return {
    montant: 0,
    mois: currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1),
    datePayement: today,
    methodePaiement: 'Espèces',
    statut: 'payé',
    notes: '',
    student_id: 0,
    nombreSeances: 4,
    datesSeances: [],
    prixParSeance: 0
  };
}
calculateTotalFromSessions() {
  if (this.currentPayment.prixParSeance && this.currentPayment.nombreSeances) {
    this.currentPayment.montant = this.currentPayment.prixParSeance * this.currentPayment.nombreSeances;
  }
}

addSessionDate() {
  if (!this.currentPayment.datesSeances) {
    this.currentPayment.datesSeances = [];
  }
  const today = new Date().toISOString().split('T')[0];
  this.currentPayment.datesSeances.push(today);
  
  // Mettre à jour le nombre de séances
  this.currentPayment.nombreSeances = this.currentPayment.datesSeances.length;
  this.calculateTotalFromSessions();
}

removeSessionDate(index: number) {
  if (this.currentPayment.datesSeances) {
    this.currentPayment.datesSeances.splice(index, 1);
    
    // Mettre à jour le nombre de séances
    this.currentPayment.nombreSeances = this.currentPayment.datesSeances.length;
    this.calculateTotalFromSessions();
  }
}


updateSessionDate(index: number, date: string) {
  if (this.currentPayment.datesSeances) {
    this.currentPayment.datesSeances[index] = date;
  }
}

  openAddForm() {
    this.editMode = false;
    this.currentPayment = this.getEmptyPayment();
    this.showForm = true;
  }

  openEditForm(payment: Payment) {
    this.editMode = true;
    this.currentPayment = { ...payment };
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.currentPayment = this.getEmptyPayment();
  }

  savePayment() {
    if (!this.currentPayment.montant || !this.currentPayment.student_id) {
      alert('Veuillez remplir les champs obligatoires');
      return;
    }

    if (this.editMode && this.currentPayment.id) {
      this.paymentsService.update(this.currentPayment.id, this.currentPayment).subscribe({
        next: () => {
          this.loadPayments();
          this.loadStatistics();
          this.closeForm();
        },
        error: (error) => {
          console.error('Erreur:', error);
          alert('Erreur lors de la modification');
        }
      });
    } else {
      this.paymentsService.create(this.currentPayment).subscribe({
        next: () => {
          this.loadPayments();
          this.loadStatistics();
          this.closeForm();
        },
        error: (error) => {
          console.error('Erreur:', error);
          alert('Erreur lors de la création');
        }
      });
    }
  }

  deletePayment(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce paiement ?')) {
      this.paymentsService.delete(id).subscribe({
        next: () => {
          this.loadPayments();
          this.loadStatistics();
        },
        error: (error) => {
          console.error('Erreur:', error);
          alert('Erreur lors de la suppression');
        }
      });
    }
  }

  getStudentName(studentId: number): string {
    const student = this.students.find(s => s.id === studentId);
    return student ? `${student.prenom} ${student.nom}` : 'Inconnu';
  }

  getStatusClass(statut: string): string {
    switch(statut) {
      case 'payé': return 'status-paid';
      case 'en attente': return 'status-pending';
      case 'annulé': return 'status-cancelled';
      default: return '';
    }
  }

  extractMois() {
    const moisSet = new Set<string>();
    this.payments.forEach(payment => {
      if (payment.mois) {
        moisSet.add(payment.mois);
      }
    });
    this.moisList = Array.from(moisSet).sort();
  }

  applyFilters() {
    this.filteredPayments = this.payments.filter(payment => {
      const studentName = payment.student ? 
        `${payment.student.prenom} ${payment.student.nom}`.toLowerCase() : '';
      
      const matchSearch = !this.searchTerm || 
        studentName.includes(this.searchTerm.toLowerCase()) ||
        payment.notes?.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchMois = !this.filterMois || payment.mois === this.filterMois;
      const matchStatut = !this.filterStatut || payment.statut === this.filterStatut;
      const matchMethode = !this.filterMethode || payment.methodePaiement === this.filterMethode;

      return matchSearch && matchMois && matchStatut && matchMethode;
    });
  }

  resetFilters() {
    this.searchTerm = '';
    this.filterMois = '';
    this.filterStatut = '';
    this.filterMethode = '';
    this.filteredPayments = this.payments;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  goToStudents() {
    this.router.navigate(['/students']);
  }

  goToGroups() {
    this.router.navigate(['/groups']);
  }

  exportToPDF() {
    const doc = new jsPDF();
    
    // Titre
    doc.setFontSize(18);
    doc.text('Liste des Paiements', 14, 22);
    
    // Date et stats
    doc.setFontSize(11);
    doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 14, 30);
    doc.text(`Total: ${this.filteredPayments.length} paiement(s)`, 14, 36);
    doc.text(`Montant total: ${this.Number(this.totalPayments).toFixed(2)} DT`, 14, 42);
    
    // Tableau
    const tableData = this.filteredPayments.map(payment => [
      payment.datePayement,
      payment.student ? `${payment.student.prenom} ${payment.student.nom}` : '-',
      payment.mois || '-',
      `${this.Number(payment.montant).toFixed(2)} DT`,
      payment.methodePaiement || '-',
      payment.statut || '-'
    ]);
    
    autoTable(doc, {
      head: [['Date', 'Élève', 'Mois', 'Montant', 'Méthode', 'Statut']],
      body: tableData,
      startY: 48,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [102, 126, 234] }
    });
    
    doc.save(`paiements_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  exportToExcel() {
    const data = this.filteredPayments.map(payment => ({
      'Date': payment.datePayement,
      'Élève': payment.student ? `${payment.student.prenom} ${payment.student.nom}` : '-',
      'Mois': payment.mois || '-',
      'Montant (DT)': this.Number(payment.montant).toFixed(2),
      'Nombre de séances': payment.nombreSeances || '-',
      'Prix par séance': payment.prixParSeance ? this.Number(payment.prixParSeance).toFixed(2) : '-',
      'Méthode de paiement': payment.methodePaiement || '-',
      'Statut': payment.statut || '-',
      'Notes': payment.notes || '-'
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Paiements');
    
    XLSX.writeFile(workbook, `paiements_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

}
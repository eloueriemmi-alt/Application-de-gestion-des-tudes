import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AttendanceService, Attendance, MarkAttendanceDto } from '../../services/attendance.service';
import { GroupsService, Group } from '../../services/groups.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-attendance',
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.css',
})
export class AttendanceComponent implements OnInit {
  groups: Group[] = [];
  selectedGroup: Group | null = null;
  selectedDate: string = '';
  attendanceRecords: Map<number, { statut: string; notes: string }> = new Map();
  isLoading = false;
  isSaving = false;
  
  stats = {
    total: 0,
    present: 0,
    absent: 0,
    retard: 0,
    tauxPresence: '0'
  };

   // Filtres pour l'historique
  showHistory = false;
  allAttendance: any[] = [];
  filteredAttendance: any[] = [];
  filterDateDebut = '';
  filterDateFin = '';
  filterGroupe = '';
  filterStatutPresence = '';

  constructor(
    private attendanceService: AttendanceService,
    private groupsService: GroupsService,
    private authService: AuthService,
    private router: Router
  ) {
    const today = new Date().toISOString().split('T')[0];
    this.selectedDate = today;
  }

  ngOnInit() {
    this.loadGroups();
  }

  loadGroups() {
    this.groupsService.getAll().subscribe({
      next: (data) => {
        this.groups = data;
      },
      error: (error) => {
        console.error('Erreur:', error);
      }
    });
  }

  onGroupChange() {
    if (this.selectedGroup && this.selectedDate) {
      this.loadAttendanceForSession();
    }
  }

  onDateChange() {
    if (this.selectedGroup && this.selectedDate) {
      this.loadAttendanceForSession();
    }
  }

  loadAttendanceForSession() {
    if (!this.selectedGroup || !this.selectedDate) return;

    this.isLoading = true;
    this.attendanceService.getByGroupAndDate(this.selectedGroup.id!, this.selectedDate).subscribe({
      next: (data) => {
        this.attendanceRecords.clear();
        
        if (data.length > 0) {
          data.forEach(record => {
            this.attendanceRecords.set(record.student_id, {
              statut: record.statut,
              notes: record.notes || ''
            });
          });
        } else {
          this.selectedGroup!.students?.forEach(student => {
            this.attendanceRecords.set(student.id!, {
              statut: 'présent',
              notes: ''
            });
          });
        }
        
        this.isLoading = false;
        this.loadStatistics();
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.isLoading = false;
      }
    });
  }

  loadStatistics() {
    if (this.selectedGroup) {
      this.attendanceService.getStatistics(this.selectedGroup.id!).subscribe({
        next: (stats) => {
          this.stats = stats;
        },
        error: (error) => {
          console.error('Erreur:', error);
        }
      });
    }
  }

  getAttendanceStatus(studentId: number): string {
    return this.attendanceRecords.get(studentId)?.statut || 'présent';
  }

  getAttendanceNotes(studentId: number): string {
    return this.attendanceRecords.get(studentId)?.notes || '';
  }

  setAttendanceStatus(studentId: number, statut: string) {
    const current = this.attendanceRecords.get(studentId) || { statut: 'présent', notes: '' };
    this.attendanceRecords.set(studentId, { ...current, statut });
  }

  setAttendanceNotes(studentId: number, notes: string) {
    const current = this.attendanceRecords.get(studentId) || { statut: 'présent', notes: '' };
    this.attendanceRecords.set(studentId, { ...current, notes });
  }

  saveAttendance() {
    if (!this.selectedGroup || !this.selectedDate) {
      alert('Veuillez sélectionner un groupe et une date');
      return;
    }

    const attendances = Array.from(this.attendanceRecords.entries()).map(([student_id, data]) => ({
      student_id,
      statut: data.statut,
      notes: data.notes
    }));

    const markData: MarkAttendanceDto = {
      dateSeance: this.selectedDate,
      group_id: this.selectedGroup.id!,
      attendances
    };

    this.isSaving = true;
    this.attendanceService.markSession(markData).subscribe({
      next: () => {
        this.isSaving = false;
        alert('Présences enregistrées avec succès !');
        this.loadStatistics();
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.isSaving = false;
        alert('Erreur lors de l\'enregistrement');
      }
    });
  }

  getStatusClass(statut: string): string {
    switch(statut) {
      case 'présent': return 'status-present';
      case 'absent': return 'status-absent';
      case 'retard': return 'status-late';
      default: return '';
    }
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

  goToPayments() {
    this.router.navigate(['/payments']);
  }

  loadHistory() {
    this.showHistory = true;
    this.attendanceService.getAll().subscribe({
      next: (data) => {
        this.allAttendance = data;
        this.filteredAttendance = data;
      },
      error: (error) => {
        console.error('Erreur:', error);
      }
    });
  }

  applyHistoryFilters() {
    this.filteredAttendance = this.allAttendance.filter(att => {
      const matchDateDebut = !this.filterDateDebut || att.dateSeance >= this.filterDateDebut;
      const matchDateFin = !this.filterDateFin || att.dateSeance <= this.filterDateFin;
      const matchGroupe = !this.filterGroupe || att.group_id === Number(this.filterGroupe);
      const matchStatut = !this.filterStatutPresence || att.statut === this.filterStatutPresence;

      return matchDateDebut && matchDateFin && matchGroupe && matchStatut;
    });
  }

  resetHistoryFilters() {
    this.filterDateDebut = '';
    this.filterDateFin = '';
    this.filterGroupe = '';
    this.filterStatutPresence = '';
    this.filteredAttendance = this.allAttendance;
  }

  toggleHistory() {
    this.showHistory = !this.showHistory;
    if (this.showHistory && this.allAttendance.length === 0) {
      this.loadHistory();
    }
  }

}
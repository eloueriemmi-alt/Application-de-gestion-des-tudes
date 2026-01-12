import { Injectable } from '@angular/core';
import { PaymentsService } from './payments.service';
import { AttendanceService } from './attendance.service';
import { StudentsService } from './students.service';
import { NotificationsService } from './notifications.service';
import { forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlertCheckerService {

  constructor(
    private paymentsService: PaymentsService,
    private attendanceService: AttendanceService,
    private studentsService: StudentsService,
    private notificationsService: NotificationsService
  ) {}

  checkAllAlerts() {
    forkJoin({
      payments: this.paymentsService.getAll(),
      attendance: this.attendanceService.getAll(),
      students: this.studentsService.getAll()
    }).subscribe({
      next: (data) => {
        this.checkLatePayments(data.payments, data.students);
        this.checkRepeatedAbsences(data.attendance, data.students);
      },
      error: (error) => {
        console.error('Erreur lors de la vérification des alertes:', error);
      }
    });
  }

  private checkLatePayments(payments: any[], students: any[]) {
    const today = new Date();
    const currentMonth = today.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    
    // Vérifier les élèves qui n'ont pas payé ce mois-ci
    students.forEach(student => {
      const hasPaymentThisMonth = payments.some(p => 
        p.student_id === student.id && 
        p.mois?.includes(currentMonth) && 
        p.statut === 'payé'
      );

      if (!hasPaymentThisMonth && student.statut === 'actif') {
        this.notificationsService.addNotification({
          type: 'warning',
          title: 'Paiement en retard',
          message: `${student.prenom} ${student.nom} n'a pas encore payé pour ${currentMonth}`,
          link: '/payments'
        });
      }
    });

    // Vérifier les paiements en attente depuis plus de 7 jours
    payments.filter(p => p.statut === 'en attente').forEach(payment => {
      const paymentDate = new Date(payment.datePayement);
      const daysDiff = Math.floor((today.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff > 7) {
        const student = students.find(s => s.id === payment.student_id);
        if (student) {
          this.notificationsService.addNotification({
            type: 'error',
            title: 'Paiement en attente urgent',
            message: `Paiement de ${student.prenom} ${student.nom} en attente depuis ${daysDiff} jours`,
            link: '/payments'
          });
        }
      }
    });
  }

  private checkRepeatedAbsences(attendance: any[], students: any[]) {
    // Grouper les présences par élève
    const attendanceByStudent: { [key: number]: any[] } = {};
    
    attendance.forEach(att => {
      if (!attendanceByStudent[att.student_id]) {
        attendanceByStudent[att.student_id] = [];
      }
      attendanceByStudent[att.student_id].push(att);
    });

    // Vérifier les absences répétées (3 absences ou plus récemment)
    Object.keys(attendanceByStudent).forEach(studentIdStr => {
      const studentId = Number(studentIdStr);
      const studentAttendance = attendanceByStudent[studentId];
      
      // Prendre les 10 dernières présences
      const recentAttendance = studentAttendance
        .sort((a, b) => new Date(b.dateSeance).getTime() - new Date(a.dateSeance).getTime())
        .slice(0, 10);

      const absences = recentAttendance.filter(a => a.statut === 'absent').length;

      if (absences >= 3) {
        const student = students.find(s => s.id === studentId);
        if (student) {
          this.notificationsService.addNotification({
            type: 'warning',
            title: 'Absences répétées',
            message: `${student.prenom} ${student.nom} a ${absences} absence(s) sur les 10 dernières séances`,
            link: '/attendance'
          });
        }
      }

      // Vérifier les retards fréquents
      const retards = recentAttendance.filter(a => a.statut === 'retard').length;
      
      if (retards >= 4) {
        const student = students.find(s => s.id === studentId);
        if (student) {
          this.notificationsService.addNotification({
            type: 'info',
            title: 'Retards fréquents',
            message: `${student.prenom} ${student.nom} a ${retards} retard(s) sur les 10 dernières séances`,
            link: '/attendance'
          });
        }
      }
    });
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Student } from './students.service';
import { environment } from '../../environments/environment';

export interface Payment {
  id?: number;
  montant: number;
  mois?: string;
  datePayement: string;
  methodePaiement?: string;
  statut?: string;
  notes?: string;
  student_id: number;
  student?: Student;
  
  // Nouvelles propriétés pour les séances
  nombreSeances?: number;
  datesSeances?: string[];
  prixParSeance?: number;
  
  createdAt?: Date;
}

export interface PaymentStatistics {
  totalPayments: number;
  totalThisMonth: number;
  paymentsCount: number;
  paymentsThisMonthCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentsService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Payment[]> {
    return this.http.get<Payment[]>(this.apiUrl);
  }

  getByStudent(studentId: number): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/student/${studentId}`);
  }

  getOne(id: number): Observable<Payment> {
    return this.http.get<Payment>(`${this.apiUrl}/${id}`);
  }

  getStatistics(): Observable<PaymentStatistics> {
    return this.http.get<PaymentStatistics>(`${this.apiUrl}/statistics`);
  }

  create(payment: Payment): Observable<Payment> {
    return this.http.post<Payment>(this.apiUrl, payment);
  }

  update(id: number, payment: Partial<Payment>): Observable<Payment> {
    return this.http.patch<Payment>(`${this.apiUrl}/${id}`, payment);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
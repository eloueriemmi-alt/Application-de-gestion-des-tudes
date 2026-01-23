import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Student {
  id?: number;
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  dateNaissance?: string;
  adresse?: string;
  niveau?: string;
  statut?: string;
  
  // Informations Parent
  nomParent?: string;
  prenomParent?: string;
  telephoneParent?: string;
  emailParent?: string;
  
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class StudentsService {
  private apiUrl = `${environment.apiUrl}/students`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  getAll(): Observable<Student[]> {
    return this.http.get<Student[]>(this.apiUrl);
  }

  getOne(id: number): Observable<Student> {
    return this.http.get<Student>(`${this.apiUrl}/${id}`);
  }

  create(student: Student): Observable<Student> {
    console.log('Service create() - Envoi:', student);
    return this.http.post<Student>(this.apiUrl, student, {
      headers: this.getHeaders()
    });
  }

  update(id: number, student: Partial<Student>): Observable<Student> {
    console.log('Service update() - Envoi:', student);
    return this.http.patch<Student>(`${this.apiUrl}/${id}`, student, {
      headers: this.getHeaders()
    });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
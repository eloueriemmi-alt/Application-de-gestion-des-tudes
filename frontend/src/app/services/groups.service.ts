import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Student } from './students.service';
import { environment } from '../../environments/environment';

export interface Group {
  id?: number;
  nom: string;
  description?: string;
  niveau?: string;
  anneeAcademique?: string;
  statut?: string;
  
  // Informations des séances
  lieu?: string;
  jourSeance?: string;
  heureDebut?: string;
  heureFin?: string;
  
  students?: Student[];
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class GroupsService {
 private apiUrl = `${environment.apiUrl}/groups`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<Group[]> {
    return this.http.get<Group[]>(this.apiUrl);
  }

  getOne(id: number): Observable<Group> {
    return this.http.get<Group>(`${this.apiUrl}/${id}`);
  }

  create(group: Group & { studentIds?: number[] }): Observable<Group> {
    return this.http.post<Group>(this.apiUrl, group);
  }

  update(id: number, group: Partial<Group> & { studentIds?: number[] }): Observable<Group> {
    return this.http.patch<Group>(`${this.apiUrl}/${id}`, group);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  addStudents(groupId: number, studentIds: number[]): Observable<Group> {
    return this.http.post<Group>(`${this.apiUrl}/${groupId}/students`, { studentIds });
  }

  removeStudent(groupId: number, studentId: number): Observable<Group> {
    return this.http.delete<Group>(`${this.apiUrl}/${groupId}/students/${studentId}`);
  }
}
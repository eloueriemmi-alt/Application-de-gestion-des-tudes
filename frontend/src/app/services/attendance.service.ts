import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Student } from './students.service';
import { Group } from './groups.service';
import { environment } from '../../environments/environment';


export interface Attendance {
  id?: number;
  dateSeance: string;
  statut: string;
  notes?: string;
  student_id: number;
  group_id: number;
  student?: Student;
  group?: Group;
  createdAt?: Date;
}

export interface MarkAttendanceDto {
  dateSeance: string;
  group_id: number;
  attendances: Array<{
    student_id: number;
    statut: string;
    notes?: string;
  }>;
}

export interface AttendanceStatistics {
  total: number;
  present: number;
  absent: number;
  retard: number;
  tauxPresence: string;
}

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private apiUrl = `${environment.apiUrl}/attendance`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(this.apiUrl);
  }

  getByGroup(groupId: number): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(`${this.apiUrl}/group/${groupId}`);
  }

  getByStudent(studentId: number): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(`${this.apiUrl}/student/${studentId}`);
  }

  getByDate(date: string): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(`${this.apiUrl}/date/${date}`);
  }

  getByGroupAndDate(groupId: number, date: string): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(`${this.apiUrl}/group/${groupId}/date/${date}`);
  }

  getStatistics(groupId?: number, studentId?: number): Observable<AttendanceStatistics> {
    let url = `${this.apiUrl}/statistics`;
    const params: string[] = [];
    
    if (groupId) params.push(`groupId=${groupId}`);
    if (studentId) params.push(`studentId=${studentId}`);
    
    if (params.length > 0) {
      url += '?' + params.join('&');
    }
    
    return this.http.get<AttendanceStatistics>(url);
  }

  markSession(data: MarkAttendanceDto): Observable<Attendance[]> {
    return this.http.post<Attendance[]>(`${this.apiUrl}/mark-session`, data);
  }

  create(attendance: Attendance): Observable<Attendance> {
    return this.http.post<Attendance>(this.apiUrl, attendance);
  }

  update(id: number, attendance: Partial<Attendance>): Observable<Attendance> {
    return this.http.patch<Attendance>(`${this.apiUrl}/${id}`, attendance);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
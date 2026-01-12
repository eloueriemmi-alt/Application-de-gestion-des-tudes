export class MarkAttendanceDto {
  dateSeance: string;
  group_id: number;
  attendances: Array<{
    student_id: number;
    statut: string;
    notes?: string;
  }>;
}
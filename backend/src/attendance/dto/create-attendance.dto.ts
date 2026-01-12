export class CreateAttendanceDto {
  dateSeance: string;
  statut: string;
  notes?: string;
  student_id: number;
  group_id: number;
}
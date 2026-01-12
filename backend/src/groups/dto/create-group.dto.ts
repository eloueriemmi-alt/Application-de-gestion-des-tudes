export class CreateGroupDto {
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
  
  // IDs des élèves à assigner
  studentIds?: number[];
}
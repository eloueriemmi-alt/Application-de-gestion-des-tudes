export class CreateStudentDto {
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
}
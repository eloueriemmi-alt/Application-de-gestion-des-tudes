export class CreatePaymentDto {
  montant: number;
  mois?: string;
  datePayement: string;
  methodePaiement?: string;
  statut?: string;
  notes?: string;
  student_id: number;
  
  // Nouvelles propriétés pour les séances
  nombreSeances?: number;
  datesSeances?: string[];
  prixParSeance?: number;
}
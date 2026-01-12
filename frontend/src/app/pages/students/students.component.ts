import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StudentsService, Student } from '../../services/students.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-students',
  imports: [CommonModule, FormsModule],
  templateUrl: './students.component.html',
  styleUrl: './students.component.css',
})
export class StudentsComponent implements OnInit {
  students: Student[] = [];
  filteredStudents: Student[] = [];
  isLoading = false;
  showForm = false;
  editMode = false;
  currentStudent: Student = this.getEmptyStudent();

  // Filtres et recherche
  searchTerm = '';
  filterNiveau = '';
  filterStatut = '';
  niveaux: string[] = [];

  constructor(
    private studentsService: StudentsService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadStudents();
  }

  loadStudents() {
    this.isLoading = true;
    this.studentsService.getAll().subscribe({
      next: (data) => {
        this.students = data;
        this.filteredStudents = data;
        this.extractNiveaux();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.isLoading = false;
      }
    });
  }

  getEmptyStudent(): Student {
    return {
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      dateNaissance: '',
      adresse: '',
      niveau: '',
      statut: 'actif',
      nomParent: '',
      prenomParent: '',
      telephoneParent: '',
      emailParent: ''
    };
  }

  openAddForm() {
    this.editMode = false;
    this.currentStudent = this.getEmptyStudent();
    this.showForm = true;
  }

  openEditForm(student: Student) {
    this.editMode = true;
    this.currentStudent = { ...student };
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.currentStudent = this.getEmptyStudent();
  }

  saveStudent() {
    if (!this.currentStudent.nom || !this.currentStudent.prenom || !this.currentStudent.email) {
      alert('Veuillez remplir les champs obligatoires');
      return;
    }

    if (this.editMode && this.currentStudent.id) {
      this.studentsService.update(this.currentStudent.id, this.currentStudent).subscribe({
        next: () => {
          this.loadStudents();
          this.closeForm();
        },
        error: (error) => {
          console.error('Erreur:', error);
          alert('Erreur lors de la modification');
        }
      });
    } else {
      this.studentsService.create(this.currentStudent).subscribe({
        next: () => {
          this.loadStudents();
          this.closeForm();
        },
        error: (error) => {
          console.error('Erreur:', error);
          alert('Erreur lors de la création');
        }
      });
    }
  }

  deleteStudent(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet élève ?')) {
      this.studentsService.delete(id).subscribe({
        next: () => {
          this.loadStudents();
        },
        error: (error) => {
          console.error('Erreur:', error);
          alert('Erreur lors de la suppression');
        }
      });
    }
  }

  extractNiveaux() {
    const niveauxSet = new Set<string>();
    this.students.forEach(student => {
      if (student.niveau) {
        niveauxSet.add(student.niveau);
      }
    });
    this.niveaux = Array.from(niveauxSet).sort();
  }

  applyFilters() {
    this.filteredStudents = this.students.filter(student => {
      const matchSearch = !this.searchTerm || 
        student.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        student.prenom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchNiveau = !this.filterNiveau || student.niveau === this.filterNiveau;
      const matchStatut = !this.filterStatut || student.statut === this.filterStatut;

      return matchSearch && matchNiveau && matchStatut;
    });
  }

  resetFilters() {
    this.searchTerm = '';
    this.filterNiveau = '';
    this.filterStatut = '';
    this.filteredStudents = this.students;
  }

  logout() {
    this.router.navigate(['/login']);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

exportToPDF() {
    const doc = new jsPDF();
    
    // Titre
    doc.setFontSize(18);
    doc.text('Liste des Élèves', 14, 22);
    
    // Date
    doc.setFontSize(11);
    doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 14, 30);
    doc.text(`Total: ${this.filteredStudents.length} élève(s)`, 14, 36);
    
    // Tableau - CORRECTION ICI
    const tableData = this.filteredStudents.map(student => [
      student.prenom + ' ' + student.nom,
      student.email,
      student.telephone || '-',
      student.niveau || '-',
      student.statut || '-'
    ]);
    
    autoTable(doc, {
      head: [['Nom Complet', 'Email', 'Téléphone', 'Niveau', 'Statut']],
      body: tableData,
      startY: 42,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [102, 126, 234] }
    });
    
    // Télécharger
    doc.save(`eleves_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  exportToExcel() {
    const data = this.filteredStudents.map(student => ({
      'Prénom': student.prenom,
      'Nom': student.nom,
      'Email': student.email,
      'Téléphone': student.telephone || '-',
      'Date de naissance': student.dateNaissance || '-',
      'Adresse': student.adresse || '-',
      'Niveau': student.niveau || '-',
      'Statut': student.statut,
      'Nom parent': student.nomParent || '-',
      'Prénom parent': student.prenomParent || '-',
      'Téléphone parent': student.telephoneParent || '-',
      'Email parent': student.emailParent || '-'
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Élèves');
    
    XLSX.writeFile(workbook, `eleves_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

}
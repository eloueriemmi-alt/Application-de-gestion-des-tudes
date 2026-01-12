import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GroupsService, Group } from '../../services/groups.service';
import { StudentsService, Student } from '../../services/students.service';
import { AuthService } from '../../services/auth.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-groups',
  imports: [CommonModule, FormsModule],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.css',
})
export class GroupsComponent implements OnInit {
  groups: Group[] = [];
  students: Student[] = [];
  isLoading = false;
  showForm = false;
  editMode = false;
  currentGroup: Group = this.getEmptyGroup();
  selectedStudentIds: number[] = [];
filteredGroups: Group[] = [];
  searchTerm = '';
  filterNiveau = '';
  filterStatut = '';
  filterJour = '';
  niveaux: string[] = [];
  jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];


  constructor(
    private groupsService: GroupsService,
    private studentsService: StudentsService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadGroups();
    this.loadStudents();
  }

 loadGroups() {
    this.isLoading = true;
    this.groupsService.getAll().subscribe({
      next: (data) => {
        this.groups = data;
        this.filteredGroups = data;
        this.extractNiveaux();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.isLoading = false;
      }
    });
  }

  loadStudents() {
    this.studentsService.getAll().subscribe({
      next: (data) => {
        this.students = data;
      },
      error: (error) => {
        console.error('Erreur:', error);
      }
    });
  }

  getEmptyGroup(): Group {
    return {
      nom: '',
      description: '',
      niveau: '',
      anneeAcademique: '',
      lieu: '',
      jourSeance: '',
      heureDebut: '',
      heureFin: '',
      statut: 'actif'
    };
  }

  openAddForm() {
    this.editMode = false;
    this.currentGroup = this.getEmptyGroup();
    this.selectedStudentIds = [];
    this.showForm = true;
  }

  openEditForm(group: Group) {
    this.editMode = true;
    this.currentGroup = { ...group };
    this.selectedStudentIds = group.students ? group.students.map(s => s.id!) : [];
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.currentGroup = this.getEmptyGroup();
    this.selectedStudentIds = [];
  }

  toggleStudent(studentId: number) {
    const index = this.selectedStudentIds.indexOf(studentId);
    if (index > -1) {
      this.selectedStudentIds.splice(index, 1);
    } else {
      this.selectedStudentIds.push(studentId);
    }
  }

  isStudentSelected(studentId: number): boolean {
    return this.selectedStudentIds.includes(studentId);
  }

  saveGroup() {
    if (!this.currentGroup.nom) {
      alert('Veuillez remplir le nom du groupe');
      return;
    }

    const groupData = {
      ...this.currentGroup,
      studentIds: this.selectedStudentIds
    };

    if (this.editMode && this.currentGroup.id) {
      this.groupsService.update(this.currentGroup.id, groupData).subscribe({
        next: () => {
          this.loadGroups();
          this.closeForm();
        },
        error: (error) => {
          console.error('Erreur:', error);
          alert('Erreur lors de la modification');
        }
      });
    } else {
      this.groupsService.create(groupData).subscribe({
        next: () => {
          this.loadGroups();
          this.closeForm();
        },
        error: (error) => {
          console.error('Erreur:', error);
          alert('Erreur lors de la création');
        }
      });
    }
  }

  deleteGroup(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce groupe ?')) {
      this.groupsService.delete(id).subscribe({
        next: () => {
          this.loadGroups();
        },
        error: (error) => {
          console.error('Erreur:', error);
          alert('Erreur lors de la suppression');
        }
      });
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  goToStudents() {
    this.router.navigate(['/students']);
  }

  extractNiveaux() {
    const niveauxSet = new Set<string>();
    this.groups.forEach(group => {
      if (group.niveau) {
        niveauxSet.add(group.niveau);
      }
    });
    this.niveaux = Array.from(niveauxSet).sort();
  }

  applyFilters() {
    this.filteredGroups = this.groups.filter(group => {
      const matchSearch = !this.searchTerm || 
        group.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        group.description?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        group.lieu?.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchNiveau = !this.filterNiveau || group.niveau === this.filterNiveau;
      const matchStatut = !this.filterStatut || group.statut === this.filterStatut;
      const matchJour = !this.filterJour || group.jourSeance === this.filterJour;

      return matchSearch && matchNiveau && matchStatut && matchJour;
    });
  }

  resetFilters() {
    this.searchTerm = '';
    this.filterNiveau = '';
    this.filterStatut = '';
    this.filterJour = '';
    this.filteredGroups = this.groups;
  }

  exportToPDF() {
    const doc = new jsPDF();
    
    // Titre
    doc.setFontSize(18);
    doc.text('Liste des Groupes/Classes', 14, 22);
    
    // Date
    doc.setFontSize(11);
    doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 14, 30);
    doc.text(`Total: ${this.filteredGroups.length} groupe(s)`, 14, 36);
    
    // Tableau
    const tableData = this.filteredGroups.map(group => [
      group.nom,
      group.niveau || '-',
      group.lieu || '-',
      group.jourSeance || '-',
      `${group.heureDebut || '-'} - ${group.heureFin || '-'}`,
      `${group.students?.length || 0} élève(s)`,
      group.statut || '-'
    ]);
    
    autoTable(doc, {
      head: [['Nom', 'Niveau', 'Lieu', 'Jour', 'Horaires', 'Élèves', 'Statut']],
      body: tableData,
      startY: 42,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [102, 126, 234] }
    });
    
    doc.save(`groupes_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  exportToExcel() {
    const data = this.filteredGroups.map(group => ({
      'Nom': group.nom,
      'Description': group.description || '-',
      'Niveau': group.niveau || '-',
      'Année académique': group.anneeAcademique || '-',
      'Lieu': group.lieu || '-',
      'Jour de séance': group.jourSeance || '-',
      'Heure de début': group.heureDebut || '-',
      'Heure de fin': group.heureFin || '-',
      'Nombre d\'élèves': group.students?.length || 0,
      'Statut': group.statut || '-',
      'Élèves': group.students?.map(s => `${s.prenom} ${s.nom}`).join(', ') || '-'
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Groupes');
    
    XLSX.writeFile(workbook, `groupes_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

}
import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { StudentsComponent } from './pages/students/students.component';
import { GroupsComponent } from './pages/groups/groups.component';
import { PaymentsComponent } from './pages/payments/payments.component';
import { AttendanceComponent } from './pages/attendance/attendance.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { authGuard } from './guards/auth.guard';
import { StatisticsComponent } from './pages/statistics/statistics.component';
import { DocumentationComponent } from './pages/documentation/documentation.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'students', 
    component: StudentsComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'groups', 
    component: GroupsComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'payments', 
    component: PaymentsComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'attendance', 
    component: AttendanceComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'profile', 
    component: ProfileComponent,
    canActivate: [authGuard]
  },

   { 
    path: 'statistics', 
    component: StatisticsComponent,
    canActivate: [authGuard]
  },

   { 
    path: 'documentation', 
    component: DocumentationComponent,
    canActivate: [authGuard]
  },

  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
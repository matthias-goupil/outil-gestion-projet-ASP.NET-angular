import { Routes } from '@angular/router';
import { ProjectList } from './pages/project-list/project-list';
import { ProjectDetail } from './pages/project-detail/project-detail';

export const routes: Routes = [
  { path: '', component: ProjectList },
  { path: 'projects/:id', component: ProjectDetail },
];

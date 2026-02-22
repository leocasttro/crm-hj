import { Routes } from '@angular/router';
import { Pedidos } from './feature/pedidos/pedidos';
import { Pacientes } from './feature/pacientes/pacientes';
import { Agenda } from './feature/agenda/agenda';
import { LayoutComponent } from './layout/layout.component';
import { authGuard } from './shared/services/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./feature/login/login').then((m) => m.LoginComponent),
  },

  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'cirurgias', pathMatch: 'full' },

      {
        path: 'cirurgias',
        component: Pedidos,
        title: 'Pedidos de cirurgia|Gerencie seus pedidos',
        data: { actionLabel: 'Nova Cirurgia', action: 'novo-pedido' },
      },
      {
        path: 'pacientes',
        component: Pacientes,
        title: 'Pacientes|Cadastro e gerenciamento de pacientes',
        data: { actionLabel: 'Novo Paciente', action: 'novo-paciente' },
      },
      {
        path: 'agenda',
        component: Agenda,
        title: 'Agenda de cirurgias | Gerencie sua agenda',
      },
    ],
  },

  { path: '**', redirectTo: 'login' },
];

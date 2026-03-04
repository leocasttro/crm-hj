import { Agenda } from './features/agenda/agenda';
import { PacientesComponent } from './features/pacientes/pacientes';
import { PedidosComponent } from './features/pedidos/pedidos';
import { Routes } from '@angular/router';

import { LayoutComponent } from './layout/layout.component';
import { authGuard } from './core/services/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login').then((m) => m.LoginComponent),
  },

  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'cirurgias', pathMatch: 'full' },

      {
        path: 'cirurgias',
        component: PedidosComponent,
        title: 'Pedidos de cirurgia|Gerencie seus pedidos',
        data: { actionLabel: 'Nova Cirurgia', action: 'novo-pedido' },
      },
      {
        path: 'pacientes',
        component: PacientesComponent,
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

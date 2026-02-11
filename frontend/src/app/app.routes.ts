import { Routes } from '@angular/router';
import { Pedidos } from './feature/pedidos/pedidos';
import { Pacientes } from './feature/pacientes/pacientes';
import { Agenda } from './feature/agenda/agenda';

export const routes: Routes = [
  { path: '', redirectTo: '/cirurgias', pathMatch: 'full' },
  {
    path: 'cirurgias',
    component: Pedidos,
    title: 'Pedidos de cirurgia|Gerencie seus pedidos',
    data: {
      actionLabel: 'Nova Cirurgia',
      action: 'novo-pedido',
    },
  },

  {
    path: 'pacientes',
    component: Pacientes,
    title: 'Pacientes|Cadastro e gerenciamento de pacientes',
    data: {
      actionLabel: 'Novo Paciente',
      action: 'novo-paciente',
    },
  },
  {
    path: 'agenda',
    component: Agenda,
    title: 'Agenda de cirurgias | Gerencie sua agenda',
  }
];

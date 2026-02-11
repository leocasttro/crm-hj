import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface EventoAgenda {
  titulo: string;
  dia: number; // 0 = Seg, 1 = Ter...
  inicio: string; // "09:30"
  fim: string; // "11:00"
  tipo?: 'primary' | 'secondary';
}

@Component({
  selector: 'app-agenda',
  imports: [CommonModule],
  templateUrl: './agenda.html',
  styleUrl: './agenda.scss',
})
export class Agenda {
  HORA_INICIAL = 8; // 08:00
  HORA_FINAL = 18; // 18:00
  ALTURA_HORA = 60; // 60px por hora

  eventos: EventoAgenda[] = [
    {
      titulo: 'Cirurgia Joelho',
      dia: 0,
      inicio: '08:30',
      fim: '10:00',
      tipo: 'primary',
    },
    {
      titulo: 'Consulta Pré-op',
      dia: 2,
      inicio: '13:00',
      fim: '14:00',
      tipo: 'secondary',
    },
  ];

  horaParaMinutos(hora: string): number {
    const [h, m] = hora.split(':').map(Number);
    return (h - 8) * 60 + m; // 8 = hora inicial
  }

  calcularTop(evento: EventoAgenda): number {
    return this.horaParaMinutos(evento.inicio);
  }

  calcularAltura(evento: EventoAgenda): number {
    return (
      this.horaParaMinutos(evento.fim) - this.horaParaMinutos(evento.inicio)
    );
  }

  eventosPorDia(dia: number): EventoAgenda[] {
    return this.eventos.filter((evento) => evento.dia === dia);
  }
}

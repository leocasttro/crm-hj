import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideBar } from '../shared/side-bar/side-bar';
import { NavBar } from '../shared/nav-bar/nav-bar';


@Component({
  standalone: true,
  selector: 'app-layout',
  imports: [RouterOutlet, SideBar, NavBar],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {}

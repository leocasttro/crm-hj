import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBar } from "./shared/nav-bar/nav-bar";
import { SideBar } from "./shared/side-bar/side-bar";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavBar, SideBar],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'crm';
}

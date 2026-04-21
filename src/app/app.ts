import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLinkActive, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLinkActive, RouterLink],
  template: ` <nav>
      <a routerLinkActive="active" routerLink="/data-table-observables">Data Table Observables</a>
      <a routerLinkActive="active" routerLink="/data-table-signals">Data Table Signals</a>
    </nav>
    <router-outlet />`,
  styles: `
    nav {
      display: flex;
      gap: 20px;
      padding: 20px;
      background-color: #f0f0f0;
    }

    a {
      text-decoration: none;
      color: #333;
      font-weight: bold;
    }

    a:hover {
      color: #007bff;
      cursor: pointer;
    }
    a.active {
      color: #007bff;
    }
  `,
})
export class App {
  protected readonly title = signal('data-table');
}

import { Component, signal } from '@angular/core';
import { DataTable } from './data-table';

@Component({
  selector: 'app-root',
  imports: [DataTable],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('data-table');
}

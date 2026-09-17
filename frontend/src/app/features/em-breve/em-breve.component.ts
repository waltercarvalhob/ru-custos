import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-em-breve',
  standalone: true,
  template: `
    <h1>{{ titulo }}</h1>
    <p class="mensagem">Em breve. Esta área ainda não possui dados cadastrados.</p>
  `,
  styles: [
    `
      .mensagem {
        color: #7a6d6a;
        margin-top: 0.5rem;
      }
    `
  ]
})
export class EmBreveComponent {
  @Input() titulo = 'Em breve';
}

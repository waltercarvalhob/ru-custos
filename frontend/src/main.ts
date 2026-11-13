import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { acordarServicos } from './app/core/acordar-servicos';

acordarServicos();

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

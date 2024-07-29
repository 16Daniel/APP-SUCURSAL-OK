import { Component } from '@angular/core';
import { ServiceGeneralService } from './core/services/service-general/service-general.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  connectionStatus: string = 'Desconocido';
  constructor(public service: ServiceGeneralService, public router: Router) 
  {
    setInterval(() => {
      // console.log("intervalo universal")
      this.checkConnection(); 
    }, 10000);
  }

  checkConnection() {
    this.service.testvpn().subscribe({
      next: data => {
      },
      error: error => {
        alert("Se perdió la conexión");
        this.router.navigate(['/login']);
        setTimeout(() => {
          location.reload(); 
        }, 1000);
      }
  });
  }

}

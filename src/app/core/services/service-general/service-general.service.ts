import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { catchError, timeout } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ServiceGeneralService {
  // URL to web api
  public apiURL = environment.apiURL;
  // URL api server
  private url: string = environment.apiURL;
  private headers = new HttpHeaders();

  constructor(private http: HttpClient, private route: Router) {
    this.headers.append('Access-Control-Allow-Origin', '*');
    this.headers.append(
      'Access-Control-Allow-Methods',
      'POST, GET, OPTIONS, PUT'
    );
    this.headers.append('Accept', 'application/json');
    this.headers.append('content-type', 'application/json');
  }
  getAPI() {
    return this.apiURL;
  }
  getURL() {
    return this.url;
  }
  serviceGeneralPostWithUrl(url, parametros): Observable<any> {
    return this.http.post(this.apiURL + url, parametros, {
      headers: this.headers,
    });
  }
  public serviceGeneralGet(url): Observable<any> {
    return this.http.get(this.apiURL + url, { headers: this.headers });
  }
  public serviceGeneralPut(url, parametros): Observable<any> {
    return this.http.put(this.apiURL + url, parametros, {
      headers: this.headers,
    });
  }
  public serviceGeneralDelete(url: string): Observable<any> {
    return this.http.delete(this.apiURL + url, { headers: this.headers });
  }

  testvpn():Observable<any>
  {
     return this.http.get<any>(this.apiURL + 'Dashboard/validarConexion',{headers:this.headers}).pipe(
        timeout(7000), // Tiempo de espera de 5 segundos
        catchError(error => {
          return throwError(error);
        })
      );
  }
}

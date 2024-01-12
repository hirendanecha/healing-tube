import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AppointmentsService {
  private baseUrl = environment.serverUrl + 'appointments';

  constructor(private http: HttpClient) { }

  createAppointment(data): Observable<any> {
    return this.http.post(`${this.baseUrl}/create-appointment`, data);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  constructor(private http: HttpClient) {}

  public globalupload(diametroF: number, diametroK: number, multiplicadorAlgoritmo: number, multiplicadorPeso: number, tamanoTextoNodos: number, opacidadNodos: number, habilidad: boolean, file: File) {
    let formData = new FormData();
    formData.append('file', file);

    return this.http.post(environment.base_api_url + '/api/globalgraph/' + diametroF + '/' + diametroK + '/' + multiplicadorAlgoritmo + '/' + multiplicadorPeso + '/' + tamanoTextoNodos + '/' + opacidadNodos + '/' + habilidad, formData);
  }

  public odsupload(tamanoTextoNodos: number, opacidadNodos: number, file: File) {
    let formData = new FormData();
    formData.append('file', file);

    return this.http.post(environment.base_api_url + '/api/odsgraph/' + tamanoTextoNodos + '/' + opacidadNodos, formData);
  }

  public steamupload(tamanoTextoNodos: number, opacidadNodos: number, file: File) {
    let formData = new FormData();
    formData.append('file', file);

    return this.http.post(environment.base_api_url + '/api/steamgraph/' + tamanoTextoNodos + '/' + opacidadNodos, formData);
  }
}

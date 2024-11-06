import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class FileShareService {

  constructor(private http: HttpClient) {
  }

  private baseUrl = 'https://localhost:9090/api';

  // Upload file to the server
  uploadFile(file: File): Observable<string> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    console.log('Uploading file:', file);
    return this.http.post<string>(`${this.baseUrl}/upload`, formData);
  }

  // Download file from the server
  downloadFile(fileKey: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/download/${fileKey}`, {responseType: 'blob'});
  }
}

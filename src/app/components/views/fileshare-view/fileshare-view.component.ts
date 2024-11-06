import {Component} from '@angular/core';
import {FileShareService} from "../../../services/file-share.service";

@Component({
  selector: 'app-fileshare-view',
  template: `
    <div class="file-upload my-5 mx-3">
      <div class="mb-5">
        <h2 class="mb-3">Upload File to S3</h2>
        <input type="file" (change)="onFileSelect($event)"/>
        <button (click)="onUpload()" [disabled]="!selectedFile">Upload</button>
      </div>
      <hr/>
      <div>
        <h2 class="mb-3">Download File from S3</h2>
        <input type="text" [(ngModel)]="fileKey" placeholder="Enter file key"/>
        <button (click)="onDownload()">Download</button>
      </div>
    </div>
  `,
  styles: [`
    input[type="text"] {
      border: 1px solid #aaa;
      border-radius: 1rem;
      padding: 0.3rem;
      margin-right: 1rem;
    }
  `]
})
export class FileshareViewComponent {
  selectedFile: File | null = null;  // Track the selected file
  fileKey: string = '';  // Track the file key for download

  constructor(private s3Service: FileShareService) {
  }

  // Handle file selection
  onFileSelect(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  // Upload file to S3
  onUpload(): void {
    if (this.selectedFile) {
      this.s3Service.uploadFile(this.selectedFile).subscribe(
        (response) => {
          alert('File uploaded successfully!');
          this.selectedFile = null;  // Clear the selected file
        },
        (error) => {
          console.error('Error uploading file:', error);
          /* alert('File upload failed!');*/
        }
      );
    }
  }

  // Download file from S3
  onDownload(): void {
    if (this.fileKey) {
      this.s3Service.downloadFile(this.fileKey).subscribe(
        (response: Blob) => {
          const blob = new Blob([response], {type: 'application/octet-stream'});
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = this.fileKey;  // Set the file name to the key or any other name
          a.click();
          window.URL.revokeObjectURL(url);
        },
        (error) => {
          console.error('Error downloading file:', error);
          alert('File download failed!');
        }
      );
    }
  }
}

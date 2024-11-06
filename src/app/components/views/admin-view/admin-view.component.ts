import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-view',
  template: `
    <h1 class="my-4">
      Admin-View!
    </h1>
    <div class="my-4">
      <h3>Videos</h3>
      <a routerLink="/admin/videos" class="btn btn-primary">Manage Videos</a>
    </div>
    <div class="my-4">
      <h3>Files</h3>
      <a routerLink="/admin/files" class="btn btn-primary">Manage Files</a>
    </div>
    <div class="my-4">
      <h3>Users</h3>
      <a routerLink="/admin/users" class="btn btn-primary">Manage Users</a>
    </div>
  `,
  styles: [
  ]
})
export class AdminViewComponent {

}

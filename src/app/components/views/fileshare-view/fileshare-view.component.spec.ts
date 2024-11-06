import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileshareViewComponent } from './fileshare-view.component';

describe('FileshareViewComponent', () => {
  let component: FileshareViewComponent;
  let fixture: ComponentFixture<FileshareViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FileshareViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileshareViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

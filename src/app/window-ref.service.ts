import { Injectable } from '@angular/core';

export interface ICustomWindow extends Window {
  __customer_global_stuff:string;
}

function getWindow(): any {
  return window;
}

@Injectable({
  providedIn: 'root'
})
export class WindowRefService {

  constructor() { }

  get nativeWindow(): ICustomWindow {
    return getWindow();
  }
}

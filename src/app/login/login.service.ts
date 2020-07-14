import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from '../../../node_modules/rxjs';
import { UserType } from '../user-type';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private currentUserSubject: BehaviorSubject<UserType>;
    public currentUser: Observable<UserType>;

  constructor(private http: HttpClient) { }

  loginMethod(req): any {

    let httpHeaders = new HttpHeaders();
    httpHeaders.append('Content-Type', 'application/json');
    httpHeaders.append("Authorization", "Basic " + btoa(req.adminId + ':' + req.password));
    httpHeaders.append('X-Requested-With', 'XMLHttpRequest');
    const adminId = 'ADM1736395766';

    const httpOptions = {
      headers: httpHeaders,
      'observe?': 'response' as 'body',
       'responseType?': 'json'
    };
    return this.http.post('https://sportsin-test-a.appspot.com/adminUser/getUserDetails', req);

    // return this.http.post<any>(`https://sportsin-test-a.appspot.com/adminUser/findAdminUser`, req)
    //         .pipe(map(user => {
    //             // store user details and basic auth credentials in local storage to keep user logged in between page refreshes
    //             user.authdata = window.btoa(req.adminId + ':' + req.password);
    //             localStorage.setItem('currentUser', JSON.stringify(user));
    //             this.currentUserSubject.next(user);
    //             return user;
    //         }));
  }

}

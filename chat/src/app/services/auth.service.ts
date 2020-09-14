import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable, of, from } from 'rxjs';
import { AlertService } from './alert.service';
import { Alert } from '../classes/alert';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { switchMap } from 'rxjs/operators';
import { AngularFireAuth } from 'angularfire2/auth';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  public currentUser: Observable<User | null>;
  public currentUserSnapshot: User | null;

  constructor(
    private router: Router,
    private alertService: AlertService,
    private afAuth: AngularFireAuth,
    private db: AngularFirestore
  ) { 
      this.currentUser = this.afAuth.authState.pipe(
      switchMap((user)=>{
        if(user){
          return this.db.doc<User>(`users/${user.uid}`).valueChanges();
        }else{
          return of(null);
        }
      }));

      this.setCurrentUserSnapshot();
  }

  public signup(firstName: string, lastName: string, email: string, password: string): Observable<boolean>{
    return from(
      this.afAuth.auth.createUserWithEmailAndPassword(email, password).
      then((user)=> {
        const userRef: AngularFirestoreDocument<User> = this.db.doc<User>(`users/${user.user.uid}`);
        const updatedUser = {
          id: user.user.uid,
          email: user.user.email,
          firstName,
          lastName,
          photoUrl: 'https://firebasestorage.googleapis.com/v0/b/chat-56d80.appspot.com/o/user.png?alt=media&token=d0c92a10-aff7-4395-82b0-682c5e8d92db',
          quote: 'Quote under construction...',
          bio: 'Bio under contstruction...'
        }

        userRef.set(updatedUser);
        return true;
      })
      .catch((err) => false)
    );
  }

  public login(email: string, password: string): Observable<boolean>{
    return from(
      this.afAuth.auth.signInWithEmailAndPassword(email, password).then((user) => true).catch((err) => false)
    );
  }

  public logout(): void{
    this.afAuth.auth.signOut().then(()=>{
      this.router.navigate(['/login']);
      this.alertService.alerts.next(new Alert('You have been signed out.'));
    });
  }

  private setCurrentUserSnapshot(): void{
    this.currentUser.subscribe(user => this.currentUserSnapshot = user);
  }
}

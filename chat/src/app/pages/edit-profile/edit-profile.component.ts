import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Resolve } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { Subscription, Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { LoadingService } from 'src/app/services/loading.service';
import { AlertService } from 'src/app/services/alert.service';
import { AngularFireStorage, AngularFireStorageReference } from 'angularfire2/storage';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { User } from 'src/app/interfaces/user';
import { Alert } from 'src/app/classes/alert';
import { AlertType } from 'src/app/enums/alert-type.enum';


@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit, OnDestroy {

  public currentUser: any = null;
  public userId: string = '';
  private subscriptions: Subscription[] = [];
  public uplodaPercent: number = 0;
  public downloadUrl: string | null = null;
  private fileRef: AngularFireStorageReference;
  constructor(
    private auth: AuthService,
    private loadingService: LoadingService,
    private alertService: AlertService,
    private route: ActivatedRoute,
    private fs: AngularFireStorage,
    private db: AngularFirestore,
    private location: Location
  ) { 
    this.loadingService.isLoading.next(true);
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.auth.currentUser.subscribe(user => {
        this.currentUser = user;
        this.loadingService.isLoading.next(false);
      })
    );

    this.subscriptions.push(
      this.route.paramMap.subscribe(param =>{
        this.userId = param.get('userId');
      })
    );
  }


  ngOnDestroy(){
    this.subscriptions.forEach( sub => sub.unsubscribe());
  }

  public uploadFile(event): void{
    const file = event.target.files[0];
    const filePath = `${file.name}_${this.currentUser.id}`;
    this.fileRef = this.fs.ref(filePath);
    const task = this.fs.upload(filePath, file);

    //observe the percentage change
    this.subscriptions.push(
      task.percentageChanges().subscribe(percetage =>{
        if(percetage < 100){
          this.loadingService.isLoading.next(true);
        }else{
          this.loadingService.isLoading.next(false);
        }
        this.uplodaPercent = percetage;
      })
    );

    //get notified when download URL is complete
      task.snapshotChanges().pipe(
      finalize(() => {
        this.fileRef.getDownloadURL().subscribe(url => {
          this.downloadUrl = url;
        });
      })
    )
    .subscribe();
  }

  public save(): void{
    let photo;

    if(this.downloadUrl){
      photo = this.downloadUrl;
    } else {
      photo = this.currentUser.photoUrl;
    }

    const user = Object.assign({}, this.currentUser, {photoUrl: photo});
    const userRef: AngularFirestoreDocument<User> = this.db.doc(`users/${user.id}`);
    userRef.set(user);
    
    //handle update in all messages
    this.db.collection('chatrooms').get().toPromise().then(querySnapshot => {
      querySnapshot.forEach(doc => {
          this.updateMsg(doc.id)
      });
    });
    //This was used to add some emails in the db
    // this.populateDB();
    this.alertService.alerts.next(new Alert('Your profile was successfully updated!', AlertType.Success));
    this.location.back();
  }

  //look over all the messages from a room
  private updateMsg(roomId){
    this.db.collection(`chatrooms/${roomId}/messages`).get().toPromise().then(querySnapshot => {
      querySnapshot.forEach(doc => {
          if(this.currentUser.email === doc.get('sender')['email']){
            this.updateSender(roomId, doc.id)
          }
      });
    });
  }
  
  //update mesage sender
  private updateSender(chatId, msgId){
    let photo;
    if(this.downloadUrl){
      photo = this.downloadUrl;
    } else {
      photo = this.currentUser.photoUrl;
    }
    this.db.collection(`chatrooms/${chatId}/messages`).doc(msgId).update({sender: Object.assign({}, this.currentUser, {photoUrl: photo})});
  }

}

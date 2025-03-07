import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ChatroomService } from 'src/app/services/chatroom.service';
import { ActivatedRoute } from '@angular/router';
import { Message } from 'src/app/classes/message';

@Component({
  selector: 'app-chatroom-window',
  templateUrl: './chatroom-window.component.html',
  styleUrls: ['./chatroom-window.component.scss']
})
export class ChatroomWindowComponent implements OnInit, OnDestroy, AfterViewChecked {

  @ViewChild('scrollContainer') private scrollContainer: ElementRef;

  private subscriptions: Subscription[] = [];
  public chatroom: any;
  public messages: any[];
  
  constructor(
    private route: ActivatedRoute,
    private chatroomService: ChatroomService
  ) { 
    this.subscriptions.push(
      this.chatroomService.selectedChatroom.subscribe(chatroom => {
        this.chatroom = chatroom;
      })
    );
    this.subscriptions.push(
      this.chatroomService.selectedChatroomMessages.subscribe(messages => {
        this.messages = messages;
      })
    );

  }

  ngOnInit() {
    this.scrollToBottom();
    this.subscriptions.push(
      this.route.paramMap.subscribe(params => {
        const chatroomId = params.get('chatroomId');
        this.chatroomService.changeChatroom.next(chatroomId);
      })
    );
  }

  ngOnDestroy(){
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngAfterViewChecked(){
    this.scrollToBottom();
  }

  private scrollToBottom(): void{
    try{
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    }catch(err){}
  }
}

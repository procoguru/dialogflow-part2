import { Component, OnInit } from '@angular/core';
import { ChatService } from '../chat.service';
import { Message } from '../models/message.model';

declare var $: any;

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  conversation: Message[] = [];
  inputMessage: string = '';

  constructor(private _chatService: ChatService) { }

  sendMessage() {
    this._chatService.sendMessageToBot(this.inputMessage);
    this.inputMessage = '';
  }

  ngOnInit() {
    this._chatService.getConversation().subscribe((conv: Message[]) => {
      this.conversation = conv;
      setTimeout(() => {
        $(".message-content-inner").stop().animate({ scrollTop: $(".message-content-inner")[0].scrollHeight + 500 }, 100);
      }, 100);
    });
    this._chatService.init();
    this._chatService.sendMessageToBot('about');
  }
  onChipSelected($event) {
    this._chatService.sendMessageToBot($event);
  }

  clearConversation() {
    this._chatService.clear();
  }
}

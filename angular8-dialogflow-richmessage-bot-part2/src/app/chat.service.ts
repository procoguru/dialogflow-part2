import { Injectable } from '@angular/core';
import { ApiAiClient } from 'api-ai-javascript/es6/ApiAiClient'
import { environment } from './../environments/environment';
import { Subject, Observable } from 'rxjs';
import { Message, RichMessage } from './models/message.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {


  token = environment.dialogFlow.accessToken;
  client = new ApiAiClient({ accessToken: this.token });

  private conversationSubject = new Subject<Message[] | RichMessage[]>();
  private conversation: Message[] | RichMessage[] | any[] = [];
  private greetMessage = "Hi there, glad to see you here ! I'm BBot designed by Bhushan for this website. We can talk about technology, article, employment history, social accounts etc. I would help you with few automated hints (or type hints) if required , Let's get started.";

  constructor() {
  }

  setConversation(con: Message[] | RichMessage[]) {
    console.log(con)
    this.conversationSubject.next(con);
  }

  getConversation(): Observable<Message[] | RichMessage[]> {
    return this.conversationSubject.asObservable();
  }

  addMessageToConversation(msg: Message | RichMessage | any) {
    this.conversation.push(msg);
    this.setConversation(this.conversation);
  }

  sendMessageToBot(messageToSend: string) {

    let msgFromHuman = new Message({
      content: messageToSend,
      sentBy: 'human'
    })

    this.addMessageToConversation(msgFromHuman);

    this.client.textRequest(messageToSend).then(response => {
      let msg = response.result.fulfillment.speech;
      let replyFromBot: Message | RichMessage = null;
      try {
        msg = atob(msg)
        msg = msg.replace(/\(/g, '{').replace(/\)/g, '}')
        msg = JSON.parse(`${msg}`)
        msg.sentBy = 'bot';
        replyFromBot = new RichMessage(msg);
      } catch (error) {
        if (msg && msg.length) {
          replyFromBot = new Message({
            content: msg,
            sentBy: 'bot'
          })
        } else {
          replyFromBot = new Message({
            content: 'Opps! I think Bhushan missed to tell me about that, could you please try with hints once?',
            sentBy: 'bot'
          })
        }

      }
      console.log(response.result.fulfillment.speech)
      this.addMessageToConversation(replyFromBot);
    });
  }

  init() {

    this.getConversation().subscribe((conv: Message[] | RichMessage[]) => {
      this.conversation = conv;
    });

    let greeting = new RichMessage({
      text: this.greetMessage,
      sentBy: 'bot',
      chips: [{
        text: 'Hints',
        input: 'hints'
      }]
    });

    this.setConversation([greeting]);
  }

  clear() {
    this.conversation = [];
    this.setConversation(this.conversation);
    this.init();
  }

}

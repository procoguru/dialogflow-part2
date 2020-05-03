import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Message } from 'src/app/models/message.model';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit {
  @Input() message: Message;
  @Output() onChipSelected: EventEmitter<string> = new EventEmitter();
  constructor() { }

  ngOnInit() {
  }

  sendMsg(chip) {
    if (chip && chip.input) {
      this.onChipSelected.emit(chip.input);
    } else {
      if (chip && chip.type)
        window.open(chip[chip.type], '__blank')
    }

  }


}

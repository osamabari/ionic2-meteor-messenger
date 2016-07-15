import Moment from 'moment';
import {Component} from '@angular/core';
import {NavController, Modal, Popover} from 'ionic-angular';
import {MeteorComponent} from 'angular2-meteor';
import {CalendarPipe} from 'angular2-moment';
import {Meteor} from 'meteor/meteor';
import {Chats, Messages} from 'api/collections';
import {MessagesPage} from '../messages/messages';
import {ChatsOptionsPage} from '../chats-options/chats-options';
import {NewChatPage} from '../new-chat/new-chat';


@Component({
  templateUrl: 'build/pages/chats/chats.html',
  pipes: [CalendarPipe]
})
export class ChatsPage extends MeteorComponent {
  static parameters = [[NavController]]

  constructor(navCtrl) {
    super();

    this.navCtrl = navCtrl;

    this.senderId = Meteor.userId();

    this.autorun(() => {
      this.chats = this.findChats();
    }, true);
  }

  findChats() {
    const chats = Chats.find({}, {
      transform: this::this.transformChat
    });

    chats.observe({
      changed: (newChat, oldChat) => this.disposeChat(oldChat),
      removed: (chat) => this.disposeChat(chat)
    });

    return chats;
  }

  disposeChat(chat) {
    if (chat.lastMessageComp) {
      chat.lastMessageComp.stop();
    }
  }

  transformChat(chat) {
    if (!this.senderId) return chat;

    chat.lastMessage = {};

    chat.lastMessageComp = this.autorun(() => {
      chat.lastMessage = this.findLastMessage(chat);
    }, true);

    return chat;
  }

  findLastMessage(chat) {
    return Messages.findOne({
      chatId: chat._id
    }, {
      sort: {createdAt: -1}
    });
  }

  addChat() {
    const modal = Modal.create(NewChatPage);
    this.navCtrl.present(modal);
  }

  removeChat(chat) {
    Chats.remove(chat._id);
  }

  showMessages(chat) {
    this.navCtrl.push(MessagesPage, {chat});
  }

  showOptions() {
    const popover = Popover.create(ChatsOptionsPage, {}, {
      cssClass: 'options-popover'
    });

    this.navCtrl.present(popover);
  }
}

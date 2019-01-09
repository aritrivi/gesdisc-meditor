import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { Comment, User } from 'app/service/model/models';

import * as _ from 'underscore';

@Component({
  selector: 'med-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css']
})
export class CommentComponent implements OnInit {

  @ViewChildren('commentThread') commentThreads: QueryList<CommentComponent>;
  @ViewChild('commentForm') commentForm: ElementRef;
	extComments: Array<any>;
  _parentId: string;
	_tree: boolean;
	_showResolved: boolean;
  _replyTo: boolean;
  _versionFilter: Date;
  _user: User;
	commentText: string;

	@Input()
	set comments(comments: Comment[]) {
		this.extComments = comments.map(c => Object.assign({}, c));
		if(this._tree) this.extComments = this.treeify(this.extComments, '_id', 'parentId', 'children');
    if(this._versionFilter) this.extComments = this.extComments.filter(c => {
      return new Date(c.version).getTime() < this._versionFilter.getTime()
    });
	};

  @Input()
	set versionFilter(versionFilter: Date) {
    if (versionFilter) this._versionFilter = new Date(versionFilter);
	};

	@Input()
	set tree(tree: boolean) {
		this._tree = tree;
	}

	@Input()
	set showResolved(showResolved: boolean) {
		this._showResolved = showResolved;
	}

  @Input()
	set parentId(parentId: string) {
		this._parentId = parentId;
	}

   @Input()
	set user(user: User) {
		this._user = user;
	}

	@Output() resolveComment = new EventEmitter<string>();
	@Output() replyComment = new EventEmitter<Object>();
  @Output() editComment = new EventEmitter<Object>();


  ngOnInit() {
  }

  resolve(_id: string) {
  	this.resolveComment.emit(_id);
  }

  openReplyForm(_id: string) {
    let comment = _.find(this.extComments, function(comment) { return comment._id == _id });
    if(comment && comment.parentId == 'root') {
      let commentThread = this.commentThreads.find((i => {return i._parentId == _id}));
      if (commentThread && commentThread.extComments.length > 0) { 
        commentThread.openReplyForm(_id); 
        } else { comment.replyTo = true; }
    } else {
      this.extComments[this.extComments.length - 1].replyTo = true;
      setTimeout(() => { this.commentForm.nativeElement.scrollIntoView({behavior: "smooth"});}, 100)
    }
  }

  openEditForm(_id: string, text: string) {
    _.find(this.extComments, function(comment) { return comment._id == _id }).edit = true;
    this.commentText = text;
  }

  closeReply(_id: string) {
  	_.find(this.extComments, function(comment) { return comment._id == _id }).replyTo = false;
  }

  closeEditForm(_id: string) {
  	_.find(this.extComments, function(comment) { return comment._id == _id }).edit = false;
    this.commentText = '';
  }

  treeify(list: Array<any>, idAttr: string, parentAttr: string, childrenAttr: string) {
    if (!idAttr) idAttr = 'id';
    if (!parentAttr) parentAttr = 'parent';
    if (!childrenAttr) childrenAttr = 'children';

    var treeList = [];
    var lookup = {};
    list.forEach(function(obj) {
        lookup[obj[idAttr]] = obj;
        obj[childrenAttr] = [];
    });
    list.forEach(function(obj) {
        if (obj[parentAttr] != null && obj[parentAttr] != 'root') {
            lookup[obj[parentAttr]][childrenAttr].push(obj);
        } else {
            treeList.push(obj);
        }
    });
    return treeList;
	};

	submitComment(_id: string, parentId: string) {
		if (parentId == 'root') parentId = _id
		let commentData = {
			'text': this.commentText,
			'parentId': parentId
		};
		this.closeReply(_id);
		this.replyComment.emit(commentData);
		this.commentText = '';
	}

	submitChildComment(event: any) {
		let commentData = {
			'text': event.text,
			'parentId': event.parentId
		};
		this.replyComment.emit(commentData);
	}

  sendEditComment(id: string) {
		let commentData = {
			'id': id,
			'text': this.commentText
		};
		this.editComment.emit(commentData);
    this.closeEditForm(id);
	}

}

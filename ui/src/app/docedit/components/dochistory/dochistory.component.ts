import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DocHistory } from '../../../service/model/docHistory';

@Component({
  selector: 'med-doc-history',
  templateUrl: './dochistory.component.html',
  styleUrls: ['./dochistory.component.css']
})
export class DochistoryComponent implements OnInit {

	@Input() dochistory: DocHistory[];
	@Output() loadVersion = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {
  }

}

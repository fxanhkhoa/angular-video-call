import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { WhoAmI } from 'src/app/model/SocketIOInfo.model';

@Component({
  selector: 'app-call-request',
  templateUrl: './call-request.component.html',
  styleUrls: ['./call-request.component.scss']
})
export class CallRequestComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<CallRequestComponent>,
    @Inject(MAT_DIALOG_DATA) public data: WhoAmI,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    this.spinner.show('sp1')
  }

  decline() {
    this.spinner.hide('sp1')
    this.dialogRef.close({result: false})
  }

  accept() {
    this.spinner.hide('sp1')
    this.dialogRef.close({result: true})
  }
}

import { Component, OnInit } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import * as _ from "lodash";
import { ElevateException } from "@elevate/shared/exceptions";
import { ExtensionDumpModel } from "../../models/dumps/extension-dump.model";

@Component({template: ""})
export class ImportBackupDialogComponent implements OnInit {

	public static readonly MAX_WIDTH: string = "80%";
	public static readonly MIN_WIDTH: string = "40%";

	public file: File;
	public displayName: string;
	public displaySize: string;

	constructor(public dialogRef: MatDialogRef<ImportBackupDialogComponent>) {
	}

	public ngOnInit(): void {
		this.file = null;
	}

	public onRestore(): void {
		throw new ElevateException("onRestore method must be overridden and used by a child component of ImportBackupDialogComponent.");
	}

	public onCancel(): void {
		this.dialogRef.close(null);
	}

	public onFileSelected(file: File): void {
		this.file = file;
		this.displayName = this.file.name;
		this.displaySize = _.floor(this.file.size / (1024 * 1024), 2) + " MB";
	}
}

@Component({
	selector: "app-import-backup-dialog",
	templateUrl: "./import-backup-dialog.component.html",
	styleUrls: ["./import-backup-dialog.component.scss"]
})
export class DesktopImportBackupDialogComponent extends ImportBackupDialogComponent implements OnInit {

	constructor(public dialogRef: MatDialogRef<DesktopImportBackupDialogComponent>) {
		super(dialogRef);
	}

	public onRestore(): void {
		if (this.file) {
			this.dialogRef.close(this.file);
		}
	}
}

@Component({
	selector: "app-progress-import-backup-dialog",
	template: `
        <mat-dialog-content class="mat-body-1">
            <div class="progress" fxLayout="column" fxLayoutAlign="center center">
                <div fxFlex="10"></div>
                <div fxFlex fxLayout="column" fxLayoutAlign="center center">
                    <div>
                        <i>Restoring your profile...</i>
                    </div>
                    <div>
                        <i>This can take few minutes. Don't close the application.</i>
                    </div>
                    <div>
                        <i>(App will be automatically reloaded when done)</i>
                    </div>
                </div>
                <div fxFlex="5"></div>
                <mat-progress-bar mode="indeterminate"></mat-progress-bar>
                <div fxFlex="10"></div>
            </div>
        </mat-dialog-content>
	`,
	styles: [`
        .progress {
            height: 100px;
            width: 450px;
        }
	`]
})
export class ProgressDesktopImportBackupDialogComponent implements OnInit {
	public ngOnInit(): void {
	}
}


@Component({
	selector: "app-import-backup-dialog",
	templateUrl: "./import-backup-dialog.component.html",
	styleUrls: ["./import-backup-dialog.component.scss"]
})
export class ExtensionImportBackupDialogComponent extends ImportBackupDialogComponent implements OnInit {

	constructor(public dialogRef: MatDialogRef<ExtensionImportBackupDialogComponent>) {
		super(dialogRef);
	}

	public onRestore(): void {

		if (this.file) {

			// Reading file, when load, import it
			const reader = new FileReader();
			reader.readAsText(this.file);
			reader.onload = (event: Event) => {
				const extensionDumpModel: ExtensionDumpModel = JSON.parse((event.target as IDBRequest).result) as ExtensionDumpModel;
				this.dialogRef.close(extensionDumpModel);
			};
		}
	}

}
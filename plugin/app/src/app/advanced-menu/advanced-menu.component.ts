import { Component, OnInit } from "@angular/core";
import { UserSettingsService } from "../shared/services/user-settings/user-settings.service";
import { ConfirmDialogDataModel } from "../shared/dialogs/confirm-dialog/confirm-dialog-data.model";
import { ConfirmDialogComponent } from "../shared/dialogs/confirm-dialog/confirm-dialog.component";
import { MatDialog, MatSnackBar } from "@angular/material";
import { SyncService } from "../shared/services/sync/sync.service";
import { DatedAthleteSettingsService } from "../shared/services/dated-athlete-settings/dated-athlete-settings.service";

@Component({
	selector: "app-advanced-menu",
	templateUrl: "./advanced-menu.component.html",
	styleUrls: ["./advanced-menu.component.scss"]
})
export class AdvancedMenuComponent implements OnInit {

	constructor(public userSettingsService: UserSettingsService,
				public datedAthleteSettingsService: DatedAthleteSettingsService,
				public syncService: SyncService,
				public dialog: MatDialog,
				public snackBar: MatSnackBar) {
	}

	public ngOnInit(): void {
	}

	public onSyncedBackupClear(): void {

		const data: ConfirmDialogDataModel = {
			title: "Clear your athlete synced data",
			content: "Are you sure to perform this action? You will be able to re-import synced data through backup file " +
				"or a new re-synchronization."
		};

		const dialogRef = this.dialog.open(ConfirmDialogComponent, {
			minWidth: ConfirmDialogComponent.MIN_WIDTH,
			maxWidth: ConfirmDialogComponent.MAX_WIDTH,
			data: data
		});

		const afterClosedSubscription = dialogRef.afterClosed().subscribe((confirm: boolean) => {

			if (confirm) {
				this.syncService.clearSyncedData().then(() => {
					afterClosedSubscription.unsubscribe();
					location.reload();
				}, error => {
					this.snackBar.open(error, "Close");
				});
			}
		});

	}

	public onPluginCacheClear(): void {

		const data: ConfirmDialogDataModel = {
			title: "Clear the plugin cache",
			content: "This will remove caches of the plugin including display preferences (e.g. app theme chosen). You will not loose your synced data, athlete settings, zones settings or global settings."
		};

		const dialogRef = this.dialog.open(ConfirmDialogComponent, {
			minWidth: ConfirmDialogComponent.MIN_WIDTH,
			maxWidth: ConfirmDialogComponent.MAX_WIDTH,
			data: data
		});

		const afterClosedSubscription = dialogRef.afterClosed().subscribe((confirm: boolean) => {
			if (confirm) {
				localStorage.clear();
				this.userSettingsService.clearLocalStorageOnNextLoad().then(() => {
					this.snackBar.open("Plugin cache has been cleared", "Reload App").afterDismissed().toPromise().then(() => {
						location.reload();
					});
					afterClosedSubscription.unsubscribe();
				});
			}
		});
	}

	public onUserSettingsReset(): void {

		const data: ConfirmDialogDataModel = {
			title: "Reset settings",
			content: "This will reset your settings to defaults including: single or dated athlete settings, zones settings and global settings. Are you sure to perform this action?"
		};

		const dialogRef = this.dialog.open(ConfirmDialogComponent, {
			minWidth: ConfirmDialogComponent.MIN_WIDTH,
			maxWidth: ConfirmDialogComponent.MAX_WIDTH,
			data: data
		});

		const afterClosedSubscription = dialogRef.afterClosed().subscribe((confirm: boolean) => {
			if (confirm) {
				Promise.all([
					this.userSettingsService.reset(),
					this.datedAthleteSettingsService.reset(),
					this.userSettingsService.clearLocalStorageOnNextLoad()
				]).then(() => {
					this.snackBar.open("Settings have been reset", "Close");
					afterClosedSubscription.unsubscribe();
				});
			}
		});
	}
}

import { UserSettingsModel } from "./user-settings/user-settings.model";
import { AppResourcesModel } from "../../core/scripts/models/app-resources.model";

export class StartCoreDataModel {
	extensionId: string;
	userSettings: UserSettingsModel;
	appResources: AppResourcesModel;
}

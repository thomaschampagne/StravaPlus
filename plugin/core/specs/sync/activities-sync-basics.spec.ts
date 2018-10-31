import * as _ from "lodash";
import { AppResourcesModel } from "../../scripts/models/app-resources.model";
import { editActivityFromArray, removeActivityFromArray } from "../tools/specs-tools";
import { SyncedActivityModel } from "../../../shared/models/sync/synced-activity.model";
import { StravaActivityModel } from "../../scripts/models/sync/strava-activity.model";
import { ActivitiesChangesModel } from "../../scripts/models/sync/activities-changes.model";
import { UserSettingsModel } from "../../../shared/models/user-settings/user-settings.model";
import { ActivitiesSynchronizer } from "../../scripts/processors/activities-synchronizer";
import { AthleteModelResolver } from "../../../shared/resolvers/athlete-model.resolver";
import { userSettingsData } from "../../../shared/user-settings.data";

describe("ActivitiesSynchronizer", () => {

	let userSettingsMock: UserSettingsModel;
	let athleteModelResolver: AthleteModelResolver;

	beforeEach((done: Function) => {
		userSettingsMock = _.cloneDeep(userSettingsData);
		athleteModelResolver = new AthleteModelResolver(userSettingsMock, []);
		done();
	});

	it("should remove activity from array properly ", (done: Function) => {

		let rawPageOfActivities: Array<SyncedActivityModel> = _.cloneDeep(require("../fixtures/sync/rawPage0120161213.json").models);
		const sourceCount = rawPageOfActivities.length;

		rawPageOfActivities = removeActivityFromArray(722210052, rawPageOfActivities); // Remove Hike "Fort saint eynard"

		expect(rawPageOfActivities).not.toBeNull();
		expect(_.find(rawPageOfActivities, {id: 722210052})).toBeUndefined();
		expect(rawPageOfActivities.length).toEqual(sourceCount - 1);
		done();
	});

	it("should edit activity from array properly ", (done: Function) => {

		let rawPageOfActivities: Array<SyncedActivityModel> = _.cloneDeep(require("../fixtures/sync/rawPage0120161213.json").models);
		const sourceCount = rawPageOfActivities.length;

		rawPageOfActivities = editActivityFromArray(722210052, rawPageOfActivities, "New_Name", "Ride"); // Edit Hike "Fort saint eynard"

		expect(rawPageOfActivities).not.toBeNull();
		const foundBack: SyncedActivityModel = _.find(rawPageOfActivities, {id: 722210052});
		expect(foundBack).toBeDefined();
		expect(foundBack.name).toEqual("New_Name");
		expect(foundBack.type).toEqual("Ride");
		expect(foundBack.display_type).toEqual("Ride");
		expect(rawPageOfActivities.length).toEqual(sourceCount);
		done();

	});

	it("should detect activities added, modified and deleted ", (done: Function) => {

		let syncedActivities: Array<SyncedActivityModel> = _.cloneDeep(require("../fixtures/sync/syncedActivities20161213.json").syncedActivities);
		let rawPageOfActivities: Array<StravaActivityModel> = _.cloneDeep(require("../fixtures/sync/rawPage0120161213.json").models);

		// Simulate Added in strava: consist to remove since synced activities...
		syncedActivities = removeActivityFromArray(723224273, syncedActivities); // Remove Ride "Bon rythme ! 33 KPH !!"
		syncedActivities = removeActivityFromArray(707356065, syncedActivities); // Remove Ride "Je suis un gros lent !"

		// Simulate Modify: consist to edit data in strava
		rawPageOfActivities = editActivityFromArray(799672885, rawPageOfActivities, "Run comeback", "Run"); // Edit "Running back... Hard !"
		rawPageOfActivities = editActivityFromArray(708752345, rawPageOfActivities, "MTB @ Bastille", "Ride"); // Edit Run "Bastille"

		// Now find+test changes
		const changes: ActivitiesChangesModel = ActivitiesSynchronizer.findAddedAndEditedActivities(rawPageOfActivities, syncedActivities);

		expect(changes).not.toBeNull();
		expect(changes.deleted).toEqual([]);

		expect(changes.added.length).toEqual(2);
		expect(_.indexOf(changes.added, 723224273)).not.toEqual(-1);
		expect(_.indexOf(changes.added, 707356065)).not.toEqual(-1);
		expect(_.indexOf(changes.added, 999999999)).toEqual(-1); // Fake

		expect(changes.edited.length).toEqual(2);
		expect(_.find(changes.edited, {id: 799672885})).toBeDefined();
		expect(_.find(changes.edited, {id: 708752345})).toBeDefined();
		let findWhere: any = _.find(changes.edited, {id: 799672885});
		expect(findWhere.name).toEqual("Run comeback");
		expect(findWhere.type).toEqual("Run");
		expect(findWhere.display_type).toEqual("Run");
		findWhere = _.find(changes.edited, {id: 708752345});
		expect(findWhere.name).toEqual("MTB @ Bastille");
		expect(findWhere.type).toEqual("Ride");
		expect(findWhere.display_type).toEqual("Ride");

		expect(ActivitiesSynchronizer.findAddedAndEditedActivities(null, null)).not.toBeNull();

		done();

	});

	it("should append activities of pages where activities added, modified and deleted ", (done: Function) => {

		const appResourcesMock: AppResourcesModel = _.cloneDeep(require("../fixtures/app-resources/app-resources.json"));
		const activitiesSynchronizer: ActivitiesSynchronizer = new ActivitiesSynchronizer(appResourcesMock, userSettingsMock, athleteModelResolver);

		// Append
		activitiesSynchronizer.appendGlobalActivitiesChanges({
			added: [1, 2],
			deleted: [],
			edited: []
		});

		expect(activitiesSynchronizer.activitiesChanges).not.toBeNull();
		expect(activitiesSynchronizer.activitiesChanges.added).toEqual([1, 2]);
		expect(activitiesSynchronizer.activitiesChanges.deleted.length).toEqual(0);
		expect(activitiesSynchronizer.activitiesChanges.edited.length).toEqual(0);

		// Append
		activitiesSynchronizer.appendGlobalActivitiesChanges({
			added: [4, 5],
			deleted: [],
			edited: [{id: 6, name: "rideName", type: "Ride", display_type: "Ride"}]
		});
		expect(activitiesSynchronizer.activitiesChanges).not.toBeNull();
		expect(activitiesSynchronizer.activitiesChanges.added.length).toEqual(4);
		expect(activitiesSynchronizer.activitiesChanges.deleted.length).toEqual(0);
		expect(activitiesSynchronizer.activitiesChanges.edited.length).toEqual(1);

		// Append
		activitiesSynchronizer.appendGlobalActivitiesChanges({
			added: [5, 10, 11],
			deleted: [15, 16],
			edited: [{id: 6, name: "rideName", type: "Ride", display_type: "Ride"}, {
				id: 22,
				name: "Run...",
				type: "Run",
				display_type: "Run"
			}]
		});
		expect(activitiesSynchronizer.activitiesChanges).not.toBeNull();
		expect(activitiesSynchronizer.activitiesChanges.added.length).toEqual(6); // id:5 already added
		expect(activitiesSynchronizer.activitiesChanges.deleted.length).toEqual(2);
		expect(activitiesSynchronizer.activitiesChanges.edited.length).toEqual(3);

		done();
	});
});

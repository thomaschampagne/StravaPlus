import * as _ from "lodash";
import * as Q from "q";
import { UserSettingsModel } from "../../../shared/models/user-settings/user-settings.model";
import { AppResourcesModel } from "../models/app-resources.model";
import { ComputeActivityThreadMessageModel } from "../models/compute-activity-thread-message.model";
import { StreamActivityModel } from "../models/sync/stream-activity.model";
import { SyncedActivityModel } from "../../../shared/models/sync/synced-activity.model";
import { SyncNotifyModel } from "../models/sync/sync-notify.model";
import { ActivityStatsMapModel } from "../models/activity-data/activity-stats-map.model";
import { AnalysisDataModel } from "../models/activity-data/analysis-data.model";
import { AthleteModelResolver } from "../../../shared/resolvers/athlete-model.resolver";

const ComputeAnalysisWorker = require("worker-loader?inline!./workers/compute-analysis.worker");

export class MultipleActivityProcessor {

	protected appResources: AppResourcesModel;
	protected userSettings: UserSettingsModel;
	protected athleteModelResolver: AthleteModelResolver;

	constructor(appResources: AppResourcesModel, userSettings: UserSettingsModel, athleteModelResolver: AthleteModelResolver) {
		this.appResources = appResources;
		this.userSettings = userSettings;
		this.athleteModelResolver = athleteModelResolver;
	}

	public static outputFields: string[] = ["id", "name", "type", "display_type", "private", "bike_id", "start_time", "distance_raw", "short_unit", "moving_time_raw", "elapsed_time_raw", "trainer", "commute", "elevation_unit", "elevation_gain_raw", "calories", "hasPowerMeter"];

	/**
	 * @return Activities array with computed stats
	 */
	public compute(activitiesWithStream: StreamActivityModel[]): Q.IPromise<SyncedActivityModel[]> {

		const deferred = Q.defer<SyncedActivityModel[]>();

		let syncedActivitiesPercentageCount = 0;

		let activitiesComputedResults: AnalysisDataModel[] = [];

		const queue: Q.Promise<any> = activitiesWithStream.reduce((promise: Q.Promise<any>, activityWithStream: StreamActivityModel, index: number) => {

			return promise.then(() => {

				// Find athlete model to compute with activity
				activityWithStream.athleteModel = this.athleteModelResolver.resolve(new Date(activityWithStream.start_time));

				return this.computeActivity(activityWithStream).then((activityComputed: AnalysisDataModel) => {

					activitiesComputedResults.push(activityComputed);

					const notify: SyncNotifyModel = {
						step: "syncedActivitiesPercentage",
						progress: syncedActivitiesPercentageCount / activitiesWithStream.length * 100,
						index: index,
						activityId: activityWithStream.id,
					};

					deferred.notify(notify);

					syncedActivitiesPercentageCount++;

				});

			});

		}, Q.resolve({}));

		// Queue Finished
		queue.then(() => {

			if (activitiesComputedResults.length !== activitiesWithStream.length) {

				const errMessage: string = "activitiesComputedResults length mismatch with activitiesWithStream length: " + activitiesComputedResults.length + " != " + activitiesWithStream.length + ")";
				deferred.reject(errMessage);

			} else {

				let activitiesComputed: SyncedActivityModel[] = [];

				_.forEach(activitiesComputedResults, (computedResult: AnalysisDataModel, index: number) => {

					const activityComputed: SyncedActivityModel = _.pick(activitiesWithStream[index], MultipleActivityProcessor.outputFields) as SyncedActivityModel;
					activityComputed.extendedStats = computedResult;
					activityComputed.athleteModel = activitiesWithStream[index].athleteModel;
					activitiesComputed.push(activityComputed);

				});

				// Sort syncedActivities by start date ascending before resolve
				activitiesComputed = _.sortBy(activitiesComputed, (item: SyncedActivityModel) => {
					return (new Date(item.start_time)).getTime();
				});

				// Finishing... force progress @ 100% for compute progress callback
				const notify: SyncNotifyModel = {
					step: "syncedActivitiesPercentage",
					progress: 100,
				};

				deferred.notify(notify);

				deferred.resolve(activitiesComputed);

				// Free mem for garbage collector!
				activitiesComputedResults = null;
				activitiesWithStream = null;
				activitiesComputed = null;
			}

		}).catch((error: any) => {
			console.error(error);
			deferred.reject(error);
		});

		return deferred.promise;
	}

	protected createActivityStatMap(activityWithStream: StreamActivityModel): ActivityStatsMapModel {

		const statsMap: ActivityStatsMapModel = {
			elevation: parseInt(activityWithStream.elevation_gain),
			movingTime: activityWithStream.moving_time_raw,
		};

		return statsMap;
	}

	protected computeActivity(activityWithStream: StreamActivityModel): Q.IPromise<AnalysisDataModel> {

		const deferred = Q.defer<AnalysisDataModel>();

		// Lets create that worker/thread!
		const computeAnalysisThread: Worker = new ComputeAnalysisWorker();

		// Create activity stats map from given activity
		const activityStatsMap: ActivityStatsMapModel = this.createActivityStatMap(activityWithStream);

		const threadMessage: ComputeActivityThreadMessageModel = {
			activityType: activityWithStream.type,
			supportsGap: (activityWithStream.type === "Run"),
			isTrainer: activityWithStream.trainer,
			appResources: this.appResources,
			userSettings: this.userSettings,
			isActivityAuthor: true, // While syncing and processing activities, elevate user is always author of the activity
			athleteModel: activityWithStream.athleteModel,
			hasPowerMeter: activityWithStream.hasPowerMeter,
			activityStatsMap: activityStatsMap,
			activityStream: activityWithStream.stream,
			bounds: null,
			returnZones: false
		};

		computeAnalysisThread.postMessage(threadMessage);

		// Listen messages from thread. Thread will send to us the result of computation
		computeAnalysisThread.onmessage = (messageFromThread: MessageEvent) => {

			// Notify upper compute method when an activity has been computed for progress percentage
			deferred.notify(activityWithStream.id);

			// Then resolve...
			deferred.resolve(messageFromThread.data);

			// Finish and kill thread
			computeAnalysisThread.terminate();

		};

		computeAnalysisThread.onerror = (err) => {

			const errorMessage: any = {
				errObject: err,
				activityId: activityWithStream.id,
			};

			// Push error uppper
			console.error(errorMessage);
			deferred.reject(errorMessage);

			// Finish and kill thread
			computeAnalysisThread.terminate();
		};

		return deferred.promise;
	}
}

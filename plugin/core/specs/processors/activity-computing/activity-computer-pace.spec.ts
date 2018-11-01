import {
	ActivityStatsMapModel,
	ActivityStreamsModel,
	AnalysisDataModel,
	AthleteModel,
	AthleteSettingsModel,
	Gender,
	UserSettingsModel
} from "@elevate/shared";
import { ActivityComputer } from "../../../scripts/processors/activity-computer";
import * as _ from "lodash";
import { Helper } from "../../../scripts/helper";

const expectPace = (expectPaceString: string, toEqualPaceString: string, secondsTolerance: number) => {

	const expectedPace: number = Helper.HHMMSStoSeconds(expectPaceString);
	const toEqualPace: number = Helper.HHMMSStoSeconds(toEqualPaceString);
	const lowerOkPace: number = toEqualPace - secondsTolerance;
	const higherOkPace: number = toEqualPace + secondsTolerance;
	const isBetween = (lowerOkPace <= expectedPace && expectedPace <= higherOkPace);

	expect(isBetween).toBeTruthy("Expected pace '" + expectPaceString + "' not between min pace: '"
		+ Helper.secondsToHHMMSS(lowerOkPace) + "' and max pace: '" + Helper.secondsToHHMMSS(higherOkPace) + "'.\r\n=> Lower: " + lowerOkPace + " <= expected: " + expectedPace + " <= higher: " + higherOkPace);

};

describe("ActivityComputer Paces", () => {

	const activityType = "Run";
	const isTrainer = false;
	const isActivityAuthor = true;
	const hasPowerMeter = false;
	const bounds: number[] = null;
	const returnZones = false;
	const userSettingsMock: UserSettingsModel = _.cloneDeep(require("../../fixtures/user-settings/2470979.json")); // Thomas C user settings
	const statsMap: ActivityStatsMapModel = _.cloneDeep(require("../../fixtures/activities/887284960/statsMap.json"));
	const athleteModel = new AthleteModel(Gender.MEN, new AthleteSettingsModel(200, 45, null, 240, null, null, 71.9));

	const PACE_SECONDS_TOLERANCE = 10;

	it("should compute grade adjusted pace of activity 887284960", (done: Function) => {

		// Given
		const stream: ActivityStreamsModel = _.cloneDeep(require("../../fixtures/activities/887284960/stream.json"));

		// When
		const activityComputer: ActivityComputer = new ActivityComputer(activityType, isTrainer, userSettingsMock, athleteModel,
			isActivityAuthor, hasPowerMeter, statsMap, stream, bounds, returnZones);
		const result: AnalysisDataModel = activityComputer.compute();

		// Then
		expect(result.paceData.genuineGradeAdjustedAvgPace).not.toBeNull();
		expectPace(Helper.secondsToHHMMSS(result.paceData.genuineGradeAdjustedAvgPace), "00:06:11", PACE_SECONDS_TOLERANCE);

		done();

	});

	it("should compute grade adjusted pace of activity 878683797", (done: Function) => {

		// Given
		const stream: ActivityStreamsModel = _.cloneDeep(require("../../fixtures/activities/878683797/stream.json"));

		// When
		const activityComputer: ActivityComputer = new ActivityComputer(activityType, isTrainer, userSettingsMock, athleteModel,
			isActivityAuthor, hasPowerMeter, statsMap, stream, bounds, returnZones);
		const result: AnalysisDataModel = activityComputer.compute();

		// Then
		expect(result.paceData.genuineGradeAdjustedAvgPace).not.toBeNull();
		expectPace(Helper.secondsToHHMMSS(result.paceData.genuineGradeAdjustedAvgPace), "00:04:43", PACE_SECONDS_TOLERANCE);

		done();

	});

	it("should compute grade adjusted pace of activity 849522984", (done: Function) => {

		// Given
		const stream: ActivityStreamsModel = _.cloneDeep(require("../../fixtures/activities/849522984/stream.json"));

		// When
		const activityComputer: ActivityComputer = new ActivityComputer(activityType, isTrainer, userSettingsMock, athleteModel,
			isActivityAuthor, hasPowerMeter, statsMap, stream, bounds, returnZones);
		const result: AnalysisDataModel = activityComputer.compute();

		// Then
		expect(result.paceData.genuineGradeAdjustedAvgPace).not.toBeNull();
		expectPace(Helper.secondsToHHMMSS(result.paceData.genuineGradeAdjustedAvgPace), "00:05:36", PACE_SECONDS_TOLERANCE);

		done();

	});

	it("should compute grade adjusted pace of activity 708752345", (done: Function) => {

		// Given
		const stream: ActivityStreamsModel = _.cloneDeep(require("../../fixtures/activities/708752345/stream.json"));

		// When
		const activityComputer: ActivityComputer = new ActivityComputer(activityType, isTrainer, userSettingsMock, athleteModel,
			isActivityAuthor, hasPowerMeter, statsMap, stream, bounds, returnZones);
		const result: AnalysisDataModel = activityComputer.compute();

		// Then
		expect(result.paceData.genuineGradeAdjustedAvgPace).not.toBeNull();
		expectPace(Helper.secondsToHHMMSS(result.paceData.genuineGradeAdjustedAvgPace), "00:06:54", PACE_SECONDS_TOLERANCE);

		done();

	});

	it("should compute grade adjusted pace of activity 1550722452", (done: Function) => {

		// Given
		const stream: ActivityStreamsModel = _.cloneDeep(require("../../fixtures/activities/1550722452/stream.json"));

		// When
		const activityComputer: ActivityComputer = new ActivityComputer(activityType, isTrainer, userSettingsMock, athleteModel,
			isActivityAuthor, hasPowerMeter, statsMap, stream, bounds, returnZones);
		const result: AnalysisDataModel = activityComputer.compute();

		// Then
		expect(result.paceData.genuineGradeAdjustedAvgPace).not.toBeNull();
		expectPace(Helper.secondsToHHMMSS(result.paceData.genuineGradeAdjustedAvgPace), "00:04:29", PACE_SECONDS_TOLERANCE);

		done();

	});

	it("should compute grade adjusted pace of activity 350379527", (done: Function) => {

		// Given
		const stream: ActivityStreamsModel = _.cloneDeep(require("../../fixtures/activities/350379527/stream.json"));

		// When
		const activityComputer: ActivityComputer = new ActivityComputer(activityType, isTrainer, userSettingsMock, athleteModel,
			isActivityAuthor, hasPowerMeter, statsMap, stream, bounds, returnZones);
		const result: AnalysisDataModel = activityComputer.compute();

		// Then
		expect(result.paceData.genuineGradeAdjustedAvgPace).not.toBeNull();
		expectPace(Helper.secondsToHHMMSS(result.paceData.genuineGradeAdjustedAvgPace), "00:06:57", PACE_SECONDS_TOLERANCE);

		done();

	});

	it("should compute grade adjusted pace of activity 1551720271", (done: Function) => {

		// Given
		const stream: ActivityStreamsModel = _.cloneDeep(require("../../fixtures/activities/1551720271/stream.json"));

		// When
		const activityComputer: ActivityComputer = new ActivityComputer(activityType, isTrainer, userSettingsMock, athleteModel,
			isActivityAuthor, hasPowerMeter, statsMap, stream, bounds, returnZones);
		const result: AnalysisDataModel = activityComputer.compute();

		// Then
		expect(result.paceData.genuineGradeAdjustedAvgPace).not.toBeNull();
		expectPace(Helper.secondsToHHMMSS(result.paceData.genuineGradeAdjustedAvgPace), "00:04:59", PACE_SECONDS_TOLERANCE);

		done();

	});

	it("should compute grade adjusted pace of activity 1553538436", (done: Function) => {

		// Given
		const stream: ActivityStreamsModel = _.cloneDeep(require("../../fixtures/activities/1553538436/stream.json"));

		// When
		const activityComputer: ActivityComputer = new ActivityComputer(activityType, isTrainer, userSettingsMock, athleteModel,
			isActivityAuthor, hasPowerMeter, statsMap, stream, bounds, returnZones);
		const result: AnalysisDataModel = activityComputer.compute();

		// Then
		expect(result.paceData.genuineGradeAdjustedAvgPace).not.toBeNull();
		expectPace(Helper.secondsToHHMMSS(result.paceData.genuineGradeAdjustedAvgPace), "00:04:02", PACE_SECONDS_TOLERANCE);

		done();

	});

	it("should compute grade adjusted pace of activity 1553976435", (done: Function) => {

		// Given
		const stream: ActivityStreamsModel = _.cloneDeep(require("../../fixtures/activities/1553976435/stream.json"));

		// When
		const activityComputer: ActivityComputer = new ActivityComputer(activityType, isTrainer, userSettingsMock, athleteModel,
			isActivityAuthor, hasPowerMeter, statsMap, stream, bounds, returnZones);
		const result: AnalysisDataModel = activityComputer.compute();

		// Then
		expect(result.paceData.genuineGradeAdjustedAvgPace).not.toBeNull();
		expectPace(Helper.secondsToHHMMSS(result.paceData.genuineGradeAdjustedAvgPace), "00:06:05", PACE_SECONDS_TOLERANCE);

		done();

	});

	it("should compute grade adjusted pace of activity 1553069082", (done: Function) => {

		// Given
		const stream: ActivityStreamsModel = _.cloneDeep(require("../../fixtures/activities/1553069082/stream.json"));

		// When
		const activityComputer: ActivityComputer = new ActivityComputer(activityType, isTrainer, userSettingsMock, athleteModel,
			isActivityAuthor, hasPowerMeter, statsMap, stream, bounds, returnZones);
		const result: AnalysisDataModel = activityComputer.compute();

		// Then
		expect(result.paceData.genuineGradeAdjustedAvgPace).not.toBeNull();
		expectPace(Helper.secondsToHHMMSS(result.paceData.genuineGradeAdjustedAvgPace), "00:05:12", PACE_SECONDS_TOLERANCE);

		done();

	});

	it("should compute grade adjusted pace of activity 1654295114", (done: Function) => {

		// Given
		const stream: ActivityStreamsModel = _.cloneDeep(require("../../fixtures/activities/1654295114/stream.json"));

		// When
		const activityComputer: ActivityComputer = new ActivityComputer(activityType, isTrainer, userSettingsMock, athleteModel,
			isActivityAuthor, hasPowerMeter, statsMap, stream, bounds, returnZones);
		const result: AnalysisDataModel = activityComputer.compute();

		// Then
		expect(result.paceData.genuineGradeAdjustedAvgPace).not.toBeNull();
		expectPace(Helper.secondsToHHMMSS(result.paceData.genuineGradeAdjustedAvgPace), "00:05:32", PACE_SECONDS_TOLERANCE);

		done();

	});

});


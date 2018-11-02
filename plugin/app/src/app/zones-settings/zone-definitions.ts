import * as moment from "moment";
import { ZoneDefinitionModel } from "../shared/models/zone-definition.model";
import { Constant } from "@elevate/shared/constants";

export const ZONE_DEFINITIONS: ZoneDefinitionModel[] = [
	{
		name: "Cycling Speed",
		value: "speed",
		units: "KPH",
		step: 0.1,
		min: 0,
		max: 9999,
		customDisplay: {
			name: "Miles Conversion",
			zoneValue: "speed",
			output: (speedKph: number) => {
				return (speedKph * Constant.KM_TO_MILE_FACTOR).toFixed(1) + " mph";
			}
		}
	}, {
		name: "Running Pace",
		value: "pace",
		units: "Seconds",
		step: 1,
		min: 0,
		max: 3599,
		customDisplay: {
			name: "Pace format mm:ss/distance",
			zoneValue: "pace",
			output: (seconds: number) => {
				const paceMetric = moment().startOf("day").seconds(seconds).format("mm:ss") + "/km";
				const paceImperial = moment().startOf("day").seconds(seconds / Constant.KM_TO_MILE_FACTOR).format("mm:ss") + "/mi";
				return paceMetric + "  | " + paceImperial;
			}
		}
	},
	{
		name: "Grade Adjusted Running Pace",
		value: "gradeAdjustedPace",
		units: "Seconds",
		step: 1,
		min: 0,
		max: 3599,
		customDisplay: {
			name: "Pace format mm:ss/distance",
			zoneValue: "gradeAdjustedPace",
			output: (seconds: number) => {
				const paceMetric = moment().startOf("day").seconds(seconds).format("mm:ss") + "/km";
				const paceImperial = moment().startOf("day").seconds(seconds / Constant.KM_TO_MILE_FACTOR).format("mm:ss") + "/mi";
				return paceMetric + "  | " + paceImperial;
			}
		}
	}, {
		name: "Heart Rate",
		value: "heartRate",
		units: "BPM",
		step: 1,
		min: 0,
		max: 9999,
		customDisplay: null
	}, {
		name: "Cycling Power",
		value: "power",
		units: "Watts",
		step: 1,
		min: 0,
		max: 9999,
		customDisplay: null
	}, {
		name: "Running Power",
		value: "runningPower",
		units: "Watts",
		step: 1,
		min: 0,
		max: 9999,
		customDisplay: null
	}, {
		name: "Cycling Cadence",
		value: "cyclingCadence",
		units: "RPM",
		step: 1,
		min: 0,
		max: 9999,
		customDisplay: null
	}, {
		name: "Running Cadence",
		value: "runningCadence",
		units: "SPM",
		step: 0.1,
		min: 0,
		max: 9999,
		customDisplay: null
	}, {
		name: "Grade",
		value: "grade",
		units: "%",
		step: 0.1,
		min: -9999,
		max: 9999,
		customDisplay: null
	}, {
		name: "Elevation",
		value: "elevation",
		units: "m",
		step: 5,
		min: 0,
		max: 9999,
		customDisplay: null
	}, {
		name: "Ascent speed",
		value: "ascent",
		units: "Vm/h",
		step: 5,
		min: 0,
		max: 9999,
		customDisplay: null
	}
];

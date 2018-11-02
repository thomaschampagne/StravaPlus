import { AthleteModel } from "@elevate/shared/models";

export class DayStressModel {

	public ids: number[];
	public date: Date;
	public timestamp: number;
	public types: string[];
	public activitiesName: string[];
	public athleteModel: AthleteModel;

	public heartRateStressScore?: number = null;
	public trainingImpulseScore?: number = null;
	public powerStressScore?: number = null;
	public runningStressScore?: number = null;
	public swimStressScore?: number = null;

	public finalStressScore: number = null;
	public previewDay: boolean;

	constructor(date: Date, previewDay: boolean) {
		this.ids = [];
		this.date = date;
		this.timestamp = date.getTime();
		this.types = [];
		this.activitiesName = [];
		this.previewDay = previewDay;
	}

	public printHeartRateStressScore(): string {
		return (this.heartRateStressScore) ? Math.floor(this.heartRateStressScore).toString() : "-";
	}

	public printTrainingImpulseScore(): string {
		return (this.trainingImpulseScore) ? Math.floor(this.trainingImpulseScore).toString() : "-";
	}

	public printPowerStressScore(): string {
		return (this.powerStressScore) ? Math.floor(this.powerStressScore).toString() : "-";
	}

	public printRunningStressScore(): string {
		return (this.runningStressScore) ? Math.floor(this.runningStressScore).toString() : "-";
	}

	public printSwimStressScore(): string {
		return (this.swimStressScore) ? Math.floor(this.swimStressScore).toString() : "-";
	}

	public printFinalStressScore(): string {
		return (this.finalStressScore) ? Math.floor(this.finalStressScore).toString() : "-";
	}


}

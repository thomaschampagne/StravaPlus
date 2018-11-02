import * as _ from "lodash";
import { AbstractDataView } from "./abstract-data.view";
import { PowerDataModel } from "@elevate/shared/models";

export class CyclingPowerDataView extends AbstractDataView {

	protected powerData: PowerDataModel;

	constructor(powerData: PowerDataModel, units: string) {
		super(units);
		this.mainColor = [63, 64, 72];
		this.setGraphTitleFromUnits();
		this.powerData = powerData;
		this.setupDistributionGraph(this.powerData.powerZones);
		this.setupDistributionTable(this.powerData.powerZones);
	}

	public render(): void {

		// Add a title
		this.content += this.generateSectionTitle("<img src=\"" + this.appResources.boltIcon + "\" style=\"vertical-align: baseline; height:20px;\"/> POWER <a target=\"_blank\" href=\"" + this.appResources.settingsLink + "#/zonesSettings/power\" style=\"float: right;margin-right: 10px;\"><img src=\"" + this.appResources.cogIcon + "\" style=\"vertical-align: baseline; height:20px;\"/></a>");

		// Creates a grid
		this.makeGrid(3, 4); // (col, row)

		this.insertDataIntoGrid();
		this.generateCanvasForGraph();

		// Push grid, graph and table to content view
		this.injectToContent();
	}

	protected insertDataIntoGrid(): void {

		this.insertContentAtGridPosition(0, 0, this.printNumber(this.powerData.weightedPower, 0), "Weighted Power", "W", "displayAdvancedPowerData");
		this.insertContentAtGridPosition(1, 0, this.printNumber(this.powerData.variabilityIndex, 2), "Variability Index", "", "displayAdvancedPowerData");

		if (this.powerData.punchFactor) {
			this.insertContentAtGridPosition(2, 0, this.printNumber(this.powerData.punchFactor, 2), "Intensity", "", "displayAdvancedPowerData");
		}

		this.insertContentAtGridPosition(0, 1, this.powerData.lowerQuartileWatts, "25% Quartile Watts", "W", "displayAdvancedPowerData");
		this.insertContentAtGridPosition(1, 1, this.powerData.medianWatts, "50% Quartile Watts", "W", "displayAdvancedPowerData");
		this.insertContentAtGridPosition(2, 1, this.powerData.upperQuartileWatts, "75% Quartile Watts", "W", "displayAdvancedPowerData");

		if (_.isNumber(this.powerData.avgWattsPerKg)) {
			this.insertContentAtGridPosition(0, 2, this.printNumber(this.powerData.avgWattsPerKg, 2), "Avg Watts/Kg", "W/Kg", "displayAdvancedPowerData");
		}

		if (_.isNumber(this.powerData.weightedWattsPerKg)) {
			this.insertContentAtGridPosition(1, 2, this.printNumber(this.powerData.weightedWattsPerKg, 2), "Weighted Watts/Kg", "W/Kg", "displayAdvancedPowerData");
		}
		if (_.isNumber(this.powerData.best20min) && !this.isSegmentEffortView) {
			this.insertContentAtGridPosition(2, 2, this.printNumber(this.powerData.best20min, 0), "Best 20min Power <sup style='color:#FC4C02; font-size:12px; position: initial;'>NEW</sup>", "W", "displayAdvancedPowerData");
		}

		if (_.isNumber(this.powerData.powerStressScore)) {
			this.insertContentAtGridPosition(0, 3, this.printNumber(this.powerData.powerStressScore, 0), "Power Stress Score", "", "displayAdvancedPowerData");
		}

		if (_.isNumber(this.powerData.powerStressScorePerHour)) {
			this.insertContentAtGridPosition(1, 3, this.printNumber(this.powerData.powerStressScorePerHour, 1), "Power Stress Score / Hour", "", "displayAdvancedPowerData");
		}
	}
}

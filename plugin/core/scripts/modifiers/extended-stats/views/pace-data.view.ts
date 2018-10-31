import * as _ from "lodash";
import { Helper } from "../../../helper";
import { AbstractDataView } from "./abstract-data.view";
import { PaceDataModel } from "../../../models/activity-data/pace-data.model";
import { ZoneModel } from "../../../../../shared/models/zone.model";

export class PaceDataView extends AbstractDataView {

	protected paceData: PaceDataModel;
	protected supportsGap: boolean;

	constructor(paceData: PaceDataModel, units: string) {
		super(units);
		this.mainColor = [9, 183, 219];
		this.setGraphTitleFromUnits();
		this.paceData = paceData;
		this.speedUnitsData = Helper.getSpeedUnitData(window.currentAthlete.get("measurement_preference"));

		this.setupDistributionGraph(this.paceData.paceZones, 1 / this.speedUnitsData.speedUnitFactor);
		this.setupDistributionTable(this.paceData.paceZones, 1 / this.speedUnitsData.speedUnitFactor);
	}

	public render(): void {

		// Add a title
		this.content += this.generateSectionTitle("<img src=\"" + this.appResources.tachometerIcon + "\" style=\"vertical-align: baseline; height:20px;\"/> PACE <a target=\"_blank\" href=\"" + this.appResources.settingsLink + "#/zonesSettings/pace\" style=\"float: right;margin-right: 10px;\"><img src=\"" + this.appResources.cogIcon + "\" style=\"vertical-align: baseline; height:20px;\"/></a>");

		// Creates a grid
		this.makeGrid(3, 2); // (col, row)

		this.insertDataIntoGrid();
		this.generateCanvasForGraph();
		this.injectToContent();
	}

	protected insertDataIntoGrid(): void {

		if (this.isSegmentEffortView) {
			const paceTimePerDistance: string = Helper.secondsToHHMMSS(this.paceData.avgPace / this.speedUnitsData.speedUnitFactor, true);
			this.insertContentAtGridPosition(0, 0, paceTimePerDistance, "Average pace", "/" + this.speedUnitsData.units, "displayAdvancedSpeedData");
		} else {
			if (_.isNumber(this.paceData.best20min)) {
				this.insertContentAtGridPosition(0, 0, Helper.secondsToHHMMSS(this.paceData.best20min / this.speedUnitsData.speedUnitFactor, true), "Best 20min Pace <sup style='color:#FC4C02; font-size:12px; position: initial;'>NEW</sup>", this.units, "displayAdvancedSpeedData");
			}
		}

		if (this.isAuthorOfViewedActivity && this.supportsGap && _.isNumber(this.paceData.runningStressScore)) {
			this.insertContentAtGridPosition(1, 0, this.printNumber(this.paceData.runningStressScore, 0), "<strong>R</strong>unning <strong>S</strong>tress <strong>S</strong>core <sup style='color:#FC4C02; font-size:12px; position: initial;'>NEW</sup>", "", "displayAdvancedSpeedData");
			this.insertContentAtGridPosition(2, 0, this.printNumber(this.paceData.runningStressScorePerHour, 1), "RSS / Hour <sup style='color:#FC4C02; font-size:12px; position: initial;'>NEW</sup>", "", "displayAdvancedSpeedData");
		}

		// Quartiles
		this.insertContentAtGridPosition(0, 1, Helper.secondsToHHMMSS(this.paceData.lowerQuartilePace / this.speedUnitsData.speedUnitFactor, true), "25% Quartile Pace", this.units, "displayAdvancedSpeedData");
		this.insertContentAtGridPosition(1, 1, Helper.secondsToHHMMSS(this.paceData.medianPace / this.speedUnitsData.speedUnitFactor, true), "50% Quartile Pace", this.units, "displayAdvancedSpeedData");
		this.insertContentAtGridPosition(2, 1, Helper.secondsToHHMMSS(this.paceData.upperQuartilePace / this.speedUnitsData.speedUnitFactor, true), "75% Quartile Pace", this.units, "displayAdvancedSpeedData");


	}

	protected setupDistributionTable(zones: ZoneModel[], ratio: number): void {

		if (!ratio) {
			ratio = 1;
		}

		if (!this.units) {
			console.error("View must have unit");
			return;
		}

		let htmlTable = "";
		htmlTable += "<div>";
		htmlTable += "<div style=\"height:500px; overflow:auto;\">";
		htmlTable += "<table class=\"distributionTable\">";

		// Generate table header
		htmlTable += "<tr>"; // Zone
		htmlTable += "<td>ZONE</td>"; // Zone
		htmlTable += "<td>FROM " + this.units.toUpperCase() + "</td>"; // bpm
		htmlTable += "<td>TO " + this.units.toUpperCase() + "</td>"; // bpm
		htmlTable += "<td>TIME</td>"; // Time
		htmlTable += "<td>% ZONE</td>"; // % in zone
		htmlTable += "</tr>";

		_.forEach(zones, (zone: ZoneModel, index: number) => {
			const from: string = (zone.from === 0) ? "&infin;" : Helper.secondsToHHMMSS(zone.from * ratio);
			htmlTable += "<tr>"; // Zone
			htmlTable += "<td>Z" + (index + 1) + "</td>"; // Zone
			htmlTable += "<td>" + from + "</th>"; // %HRR
			htmlTable += "<td>" + Helper.secondsToHHMMSS(zone.to * ratio) + "</th>"; // %HRR
			htmlTable += "<td>" + Helper.secondsToHHMMSS(zone.s) + "</td>"; // Time%
			htmlTable += "<td>" + zone.percentDistrib.toFixed(1) + "%</td>"; // % in zone
			htmlTable += "</tr>";
		});

		htmlTable += "</table>";
		htmlTable += "</div>";
		htmlTable += "</div>";
		this.table = $(htmlTable);
	}

	protected setupDistributionGraph(zones: ZoneModel[], ratio: number): void {

		if (!ratio) {
			ratio = 1;
		}

		const labelsData: string[] = [];
		const distributionArray: string[] = [];

		_.forEach(zones, (zone: ZoneModel, index: number) => {
			const from: string = (zone.from === 0) ? "Infinite" : Helper.secondsToHHMMSS(zone.from * ratio);
			const label: string = "Z" + (index + 1) + ": " + from + " - " + Helper.secondsToHHMMSS(zone.to * ratio) + " " + this.units;
			labelsData.push(label);

			distributionArray.push((zone.s / 60).toFixed(2));
		});

		// Update labels
		this.graphData = {
			labels: labelsData,
			datasets: [{
				label: this.graphTitle,
				backgroundColor: "rgba(" + this.mainColor[0] + ", " + this.mainColor[1] + ", " + this.mainColor[2] + ", 0.5)",
				borderColor: "rgba(" + this.mainColor[0] + ", " + this.mainColor[1] + ", " + this.mainColor[2] + ", 1)",
				borderWidth: 1,
				hoverBackgroundColor: "rgba(" + this.mainColor[0] + ", " + this.mainColor[1] + ", " + this.mainColor[2] + ", 0.8)",
				hoverBorderColor: "rgba(" + this.mainColor[0] + ", " + this.mainColor[1] + ", " + this.mainColor[2] + ", 1)",
				data: distributionArray,
			}],
		};
	}

	public setSupportsGap(supportsGap: boolean): void {
		this.supportsGap = supportsGap;
	}

}

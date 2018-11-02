import { Mode } from "./mode.enum";
import { ZoneDefinitionModel } from "../../shared/models/zone-definition.model";
import { ZoneModel } from "@elevate/shared/models";

export class ZoneImportExportDataModel {

	public zoneDefinition: ZoneDefinitionModel;
	public zonesData?: ZoneModel[];
	public mode: Mode;

	constructor(zoneDefinition: ZoneDefinitionModel, zonesData: ZoneModel[], mode: Mode) {
		this.zoneDefinition = zoneDefinition;
		this.zonesData = zonesData;
		this.mode = mode;
	}
}

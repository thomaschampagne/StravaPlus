import { MeasureSystem } from "@elevate/shared/enums";
import { Stat } from "../stat.model";
import { Sensor } from "../../sensors/sensor.model";

export class StatDisplay {
  private static readonly MISSING_VALUE_DISPLAY: string = "-";

  public name: string;
  public unit: string | null;
  public value: number | string;
  public description: string;
  public color: string;

  public static create(stat: Stat<any>, statValue: number | string, measureSystem: MeasureSystem): StatDisplay {
    let unit: string;

    if (stat.unit || stat.unit === null) {
      unit = stat.unit;
    } else if (stat.baseSensor.displayUnit) {
      unit = stat.baseSensor.getDisplayUnit(measureSystem);
    } else {
      unit = null;
    }

    let color: string = null;
    if (stat.baseSensor instanceof Sensor) {
      color = stat.baseSensor.color;
    }

    const isValueMissing = !Number.isFinite(statValue);

    let convertedValue: number | string;
    if (isValueMissing) {
      convertedValue = StatDisplay.MISSING_VALUE_DISPLAY;
    } else {
      convertedValue = stat.baseSensor.fromStatsConvert(
        statValue,
        measureSystem,
        stat.roundDecimals || stat.baseSensor.defaultRoundDecimals
      );
    }

    return {
      name: stat.name,
      unit: unit,
      value: convertedValue,
      description: isValueMissing && stat.missingMessage ? `${stat.missingMessage}` : stat.description,
      color: color
    };
  }
}
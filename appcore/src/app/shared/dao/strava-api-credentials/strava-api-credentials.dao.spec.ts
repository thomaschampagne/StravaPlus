import { TestBed } from "@angular/core/testing";

import { StravaApiCredentialsDao } from "./strava-api-credentials.dao";
import { CoreModule } from "../../../core/core.module";
import { SharedModule } from "../../shared.module";
import { DesktopModule } from "../../modules/desktop/desktop.module";

describe("StravaApiCredentialsDao", () => {
	beforeEach(() => TestBed.configureTestingModule({
		imports: [
			CoreModule,
			SharedModule,
			DesktopModule
		]
	}));

	it("should be created", () => {
		const service: StravaApiCredentialsDao = TestBed.inject(StravaApiCredentialsDao);
		expect(service).toBeTruthy();
	});
});
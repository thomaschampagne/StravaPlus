import * as _ from "lodash";
import { Loader } from "../modules/loader";
import { AppResourcesModel } from "./models/app-resources.model";
import { CoreMessages, userSettingsData, UserSettingsModel } from "@elevate/shared";
import { StartCoreDataModel } from "./models/start-core-data.model";

export class Content {

	public static loader: Loader = new Loader();

	protected appResources: AppResourcesModel;
	protected userSettings: UserSettingsModel;

	constructor(userSettings: UserSettingsModel, appResources: AppResourcesModel) {
		this.userSettings = userSettings;
		this.appResources = appResources;
	}

	public isExtensionRunnableInThisContext(): boolean {

		let isRunnable = true;

		// Eject if http://www.strava.com/routes/new OR http://www.strava.com/routes/XXXX/edit
		if (window.location.pathname.match(/^\/routes\/new/) ||
			window.location.pathname.match(/^\/routes\/(\d+)\/edit$/) ||
			window.location.pathname.match(/^\/about/) ||
			window.location.pathname.match(/^\/running-app/) ||
			window.location.pathname.match(/^\/features/) ||
			window.location.pathname.match(/^\/api/) ||
			window.location.pathname.match(/^\/premium/) ||
			window.location.pathname.match(/^\/gopremium/) ||
			window.location.pathname.match(/^\/store/) ||
			window.location.pathname.match(/^\/how-it-works/)) {

			isRunnable = false;
		}

		// Do not run extension if user not logged
		if (document.body.classList.contains("is-home-page") ||
			document.body.classList.contains("logged-out")
		) {
			isRunnable = false;
		}

		return isRunnable;
	}

	public start(): void {

		// Skip execution if needed
		if (!this.isExtensionRunnableInThisContext()) {
			console.log("Skipping Elevate chrome extension execution in this page");
			return;
		}

		chrome.storage.sync.get(this.userSettings, (chromeSettings: UserSettingsModel) => {

			if (_.isEmpty(chromeSettings)) { // If settings from chrome sync storage are empty
				chromeSettings = this.userSettings;
			}
			const defaultSettings = _.keys(userSettingsData);
			const syncedSettings = _.keys(chromeSettings);
			if (_.difference(defaultSettings, syncedSettings).length !== 0) { // If settings shape has changed
				_.defaults(chromeSettings, userSettingsData);
			}

			const startCoreData: StartCoreDataModel = {
				extensionId: chrome.runtime.id,
				userSettings: chromeSettings,
				appResources: this.appResources,
			};

			// Inject jQuery as $
			Content.loader.injectJS("const $ = jQuery;");

			Content.loader.require([
				"core/boot.bundle.js"
			], () => {
				this.emitStartCoreEvent(startCoreData);
			});
		});

	}

	protected emitStartCoreEvent(startCoreData: StartCoreDataModel) {
		const startCorePluginEvent: CustomEvent = new CustomEvent("Event");
		startCorePluginEvent.initCustomEvent(CoreMessages.ON_START_CORE_EVENT, true, true, startCoreData);
		dispatchEvent(startCorePluginEvent);
	}
}

export let appResources: AppResourcesModel = {
	settingsLink: chrome.extension.getURL("/app/index.html"),
	logoElevate: chrome.extension.getURL("/core/icons/logo_elevate_no_circle.svg"),
	menuIconBlack: chrome.extension.getURL("/core/icons/ic_menu_24px_black.svg"),
	menuIconOrange: chrome.extension.getURL("/core/icons/ic_menu_24px_orange.svg"),
	remoteViewIcon: chrome.extension.getURL("/core/icons/ic_open_in_new_24px.svg"),
	pollIcon: chrome.extension.getURL("/core/icons/ic_poll_24px.svg"),
	helpIcon: chrome.extension.getURL("/core/icons/ic_help_black_24px.svg"),
	veloviewerIcon: chrome.extension.getURL("/core/icons/veloviewer.ico"),
	raceshapeIcon: chrome.extension.getURL("/core/icons/raceshape.ico"),
	veloviewerDashboardIcon: chrome.extension.getURL("/core/icons/ic_dashboard_24px.svg"),
	veloviewerChallengesIcon: chrome.extension.getURL("/core/icons/ic_landscape_24px.svg"),
	labIcon: chrome.extension.getURL("/core/icons/lab.png"),
	settingsIcon: chrome.extension.getURL("/core/icons/ic_settings_24px.svg"),
	heartIcon: chrome.extension.getURL("/core/icons/ic_favorite_24px.svg"),
	zonesIcon: chrome.extension.getURL("/core/icons/ic_format_line_spacing_24px.svg"),
	komMapIcon: chrome.extension.getURL("/core/icons/ic_looks_one_24px.svg"),
	heatmapIcon: chrome.extension.getURL("/core/icons/ic_whatshot_24px.svg"),
	bugIcon: chrome.extension.getURL("/core/icons/ic_bug_report_24px.svg"),
	rateIcon: chrome.extension.getURL("/core/icons/ic_star_24px.svg"),
	aboutIcon: chrome.extension.getURL("/core/icons/ic_info_outline_24px.svg"),
	peopleIcon: chrome.extension.getURL("/core/icons/ic_supervisor_account_black_24px.svg"),
	eyeIcon: chrome.extension.getURL("/core/icons/ic_remove_red_eye_24px.svg"),
	bikeIcon: chrome.extension.getURL("/core/icons/ic_directions_bike_24px.svg"),
	mapIcon: chrome.extension.getURL("/core/icons/ic_map_24px.svg"),
	wheatherIcon: chrome.extension.getURL("/core/icons/ic_wb_sunny_24px.svg"),
	twitterIcon: chrome.extension.getURL("/core/icons/twitter.svg"),
	systemUpdatesIcon: chrome.extension.getURL("/core/icons/ic_system_update_24px.svg"),
	fitnessCenterIcon: chrome.extension.getURL("/core/icons/ic_fitness_center_black_24px.svg"),
	timelineIcon: chrome.extension.getURL("/core/icons/ic_timeline_black_24px.svg"),
	dateRange: chrome.extension.getURL("/core/icons/ic_date_range_black_24px.svg"),
	athleteIcon: chrome.extension.getURL("/core/icons/ic_accessibility_black_24px.svg"),
	donateIcon: chrome.extension.getURL("/core/icons/ic_attach_money_24px.svg"),
	shareIcon: chrome.extension.getURL("/core/icons/ic_share_24px.svg"),
	trackChangesIcon: chrome.extension.getURL("/core/icons/ic_track_changes_24px.svg"),
	trendingUpIcon: chrome.extension.getURL("/core/icons/ic_trending_up_black_24px.svg"),
	qrCodeIcon: chrome.extension.getURL("/core/icons/qrcode.svg"),
	lightbulbIcon: chrome.extension.getURL("/core/icons/fa-lightbulb-o.png"),
	heartBeatIcon: chrome.extension.getURL("/core/icons/fa-heartbeat.png"),
	areaChartIcon: chrome.extension.getURL("/core/icons/fa-area-chart.png"),
	tachometerIcon: chrome.extension.getURL("/core/icons/fa-tachometer.png"),
	boltIcon: chrome.extension.getURL("/core/icons/fa-bolt.png"),
	loadingIcon: chrome.extension.getURL("/core/icons/loading.gif"),
	circleNotchIcon: chrome.extension.getURL("/core/icons/fa-circle-o-notch.png"),
	lineChartIcon: chrome.extension.getURL("/core/icons/fa-line-chart.png"),
	logArrowUpIcon: chrome.extension.getURL("/core/icons/fa-long-arrow-up.png"),
	cogIcon: chrome.extension.getURL("/core/icons/fa-cog.png"),
	logoNoText: chrome.extension.getURL("/core/icons/logo_no_text.svg"),
	logoTextOnly: chrome.extension.getURL("/core/icons/logo_text_only.svg"),
	extVersion: chrome.runtime.getManifest().version,
	extVersionName: chrome.runtime.getManifest().version_name,
	extensionId: chrome.runtime.id,
};

const content: Content = new Content(userSettingsData, appResources);
content.start();

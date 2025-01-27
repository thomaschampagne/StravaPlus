export class StravaActivityModel {
  public id: number;
  public name: string;
  public sport_type: string;
  public display_type: string;
  public activity_type_display_name: string;
  public private: boolean;
  public bike_id: number | null;
  public athlete_gear_id: number | null;
  public start_date: string;
  public start_date_local_raw: number;
  public start_time: string;
  public start_day: string;
  public distance: string;
  public distance_raw: number;
  public long_unit: string;
  public short_unit: string;
  public moving_time: string;
  public moving_time_raw: number;
  public elapsed_time: string;
  public elapsed_time_raw: number;
  public trainer: boolean;
  public static_map: string;
  public has_latlng: boolean;
  public commute: boolean;
  public elevation_gain: string;
  public elevation_unit: string;
  public elevation_gain_raw: number;
  public description: string | null;
  public activity_url: string;
  public activity_url_for_twitter: string;
  public twitter_msg: string;
  public is_new: boolean;
  public is_changing_type: boolean;
  public suffer_score: number | null;
  public tags: { [key: string]: boolean };
  public selected_tag_type: string | null;
  public flagged: boolean;
  public hide_power: boolean;
  public hide_heartrate: boolean;
  public leaderboard_opt_out: boolean;
  public visibility: string;
}

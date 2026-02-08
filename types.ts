export enum AlertType {
  SOUND = 'sound',
  SOUND_AND_VIBRATE = 'sound and vibrate',
  VIBRATE = 'vibrate'
}

export type Alert = {
  at: number;
  on: boolean;
  repeat: boolean;
  type: AlertType;
  id: string;
};

export type Count = {
  alerts: Alert[] | [];
  createdAt: string;
  currentlyCounting: 1 | 0;
  id: string;
  lastModified: string;
  saved: 1 | 0;
  title?: string;
  value: number;
};

export enum CountValueChangeSource {
  SCREEN_BUTTON = 'screen_button',
  SET_COUNT = 'set_count',
  VOLUME_BUTTON = 'volume_button'
}

export type DbCount = {
  alerts: string; // JSON stringified array of alerts
  createdAt: string;
  currentlyCounting: 1 | 0;
  id: string;
  lastModified: string;
  saved: 1;
  title: string;
  value: number;
};

export enum Screens {
  MULTI = 'multi',
  SETTINGS = 'settings',
  SETTINGS_TROUBLESHOOTING = 'settings_troubleshooting',
  SINGLE = 'single'
}

export type SetDropdownVisible = React.Dispatch<React.SetStateAction<boolean>>;
export type SetShowEditInputField = React.Dispatch<React.SetStateAction<boolean>>;
export type SetShowOptionsMenu = React.Dispatch<React.SetStateAction<boolean>>;
export type SetShowSaveInputField = React.Dispatch<React.SetStateAction<boolean>>;
export type SetTitleToSave = React.Dispatch<React.SetStateAction<string>>;

export enum TrackingEventNames {
  ALERT_AT_VALUE_EDITED = 'alert_at_value_edited',
  ALERT_DELETED = 'alert_deleted',
  ALERT_DISMISSED = 'alert_dismissed',
  ALERT_PLAY_SOUND_TOGGLED_OFF = 'alert_play_sound_toggled_off',
  ALERT_PLAY_SOUND_TOGGLED_ON = 'alert_play_sound_toggled_on',
  ALERT_REPEATING_TOGGLED_OFF = 'alert_repeating_toggled_off',
  ALERT_REPEATING_TOGGLED_ON = 'alert_repeating_toggled_on',
  ALERT_SAVED = 'alert_saved',
  ALERT_TOGGLED_OFF = 'alert_toggled_off',
  ALERT_TOGGLED_ON = 'alert_toggled_on',
  ALERT_TRIGGERED = 'alert_triggered',
  ALERT_VIBRATE_TOGGLED_OFF = 'alert_vibrate_toggled_off',
  ALERT_VIBRATE_TOGGLED_ON = 'alert_vibrate_toggled_on',
  APP_STORE_REVIEW_PROMPT_NOT_AVAILABLE = 'app_strore_review_prompt_not_available',
  COUNT_DELETED = 'count_deleted',
  COUNT_INFO_DISMISSED = 'count_info_dismissed',
  COUNT_INFO_OPENED = 'count_info_opened',
  COUNT_RESET = 'count_reset',
  COUNT_SAVED = 'count_saved',
  COUNT_TITLE_UPDATED = 'count_title_updated',
  COUNT_VALUE_CHANGED = 'count_value_changed',
  COUNTING_MODE_CHANGED = 'counting_mode_changed',
  EDIT_COUNT_NAME_SELECTED = 'edit_count_name_selected',
  ERROR = 'error',
  NEW_COUNT_STARTED = 'new_count_started',
  SCREEN_HIDDEN = 'screen_hidden',
  SCREEN_VIEWED = 'screen_viewed',
  SWITCHED_COUNT = 'switched_count',
  WARNING = 'warning'
}

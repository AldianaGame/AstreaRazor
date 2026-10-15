export type LimiterMode = 'pwm_soft' | 'cycle_skip' | 'hard_cut' | 'pop_and_bang';
export type BackfireMode = 'decel_pops' | 'limiter_flame' | 'antilag_aggressive';
export type RumblePattern = 'mild_lope' | 'racing_cam' | 'harley_chop' | 'custom_30_step';

export interface LimiterConfig {
  pulserInPin: string;       // e.g. "D2" (GPIO4)
  cutOutPin: string;         // e.g. "D1" (GPIO5)
  launchSwitchPin: string;   // e.g. "D6" (GPIO12)
  shiftLightPin: string;     // e.g. "D4" (GPIO2)
  // Master On/Off Switch & Histeresis Limiter
  enableLimiter: boolean;    // Master ON/OFF untuk fitur rev limiter
  limiterHysteresis: number; // Histeresis RPM (default 250 RPM): cut aktif di maxRpm, mati di (maxRpm - limiterHysteresis)

  maxRpm: number;            // e.g. 10500
  softCutBand: number;       // e.g. 600 (soft cut starts at maxRpm - softCutBand)
  launchRpm: number;         // e.g. 5500
  pulsesPerRev: number;      // 1 (standard 1-cylinder 4T / 2T single tooth)
  debounceMicros: number;    // e.g. 2500 (ignores spikes > 24000 RPM)
  pwmFrequency: number;      // e.g. 1000 Hz
  limiterMode: LimiterMode;
  invertCutOutput: boolean;  // false = HIGH cuts pulser (shunts to ground)
  enableLaunchControl: boolean;
  enableShiftLight: boolean;
  enableSerialTelemetry: boolean;
  enableOledDisplay: boolean;
  enableWifiTuner: boolean;
  wifiSsid: string;          // Default: "WEMOS-CDI-LIMITER"
  wifiPass: string;          // Default: "12345678"

  // Fitur Backfire / Pop & Bangs
  enableBackfire: boolean;
  backfireMode: BackfireMode;
  backfireAggression: number; // 1 (Mild) to 5 (Extremely Aggressive Flame)

  // Fitur Rumble Idle / Chop Cam (Idle Pincang 30-Step Sequencer)
  enableRumbleIdle: boolean;
  rumblePattern: RumblePattern;
  rumbleMaxRpm: number;      // Batas atas aktifnya rumble idle (default 2200 RPM)
  rumbleSteps: boolean[];    // Array 30 step (true = Spark Fire, false = Spark Cut)
  rumbleSpeed: number;       // Kecepatan / Tempo (1=Cepat 1 pulsa/step, 2=Sedang, 3=Lambat Berat, 4=Super Slow Helikopter)
}

export interface EngineTelemetry {
  rpm: number;
  targetRpm: number;
  throttle: number;         // 0 - 100%
  isLimiting: boolean;
  isSoftCut: boolean;
  isHardCut: boolean;
  isSoftCutting: boolean;
  isHardCutting: boolean;
  isLaunchActive: boolean;
  isBackfiring: boolean;
  isRumbleActive: boolean;
  activeRumbleStep: number;  // 0 - 29 (Step kursor aktif pada panel kotak 30-step)
  exhaustFlame: number;     // 0 - 100%
  pwmDuty: number;          // 0 - 100%
  sparkCutRatio: number;    // 0 - 100%
  pulserFrequencyHz: number;
  pulserPeriodUs: number;
  shiftLightOn: boolean;
}

import type { WeatherId } from './types';

export interface WeatherOption {
  id: WeatherId;
  emoji: string;
  /** Translation key under `weather.*` for the label */
  labelKey: WeatherId;
  /** Short helper hint shown beneath the chip — English, free text */
  hintEn: string;
}

export const weatherOptions: WeatherOption[] = [
  {
    id: 'humid',
    emoji: '💧',
    labelKey: 'humid',
    hintEn: 'Sticky, cloudy, no rain. Dew on leaves in the morning.',
  },
  {
    id: 'rainy',
    emoji: '🌧️',
    labelKey: 'rainy',
    hintEn: 'Active rainfall or very recent heavy showers.',
  },
  {
    id: 'hot_dry',
    emoji: '☀️',
    labelKey: 'hot_dry',
    hintEn: 'High temperature, low humidity, dry soil.',
  },
  {
    id: 'cool_dry',
    emoji: '🌫️',
    labelKey: 'cool_dry',
    hintEn: 'Cold mornings, fog or low cloud, dry leaves.',
  },
  {
    id: 'normal',
    emoji: '🌤️',
    labelKey: 'normal',
    hintEn: 'Typical weather for this week — no extremes.',
  },
];

export const weatherMap: Record<WeatherId, WeatherOption> = weatherOptions.reduce(
  (acc, w) => ({ ...acc, [w.id]: w }),
  {} as Record<WeatherId, WeatherOption>
);

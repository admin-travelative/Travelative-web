const CACHE_TTL_MS = 8 * 60 * 60 * 1000;
const CACHE_KEY_PREFIX = 'travelative-weather-v1:';

const memoryCache = new Map();
const inFlightRequests = new Map();

const SNOW_CODES = new Set([71, 73, 75, 77, 85, 86]);
const RAIN_CODES = new Set([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82]);
const FOG_CODES = new Set([45, 48]);
const STORM_CODES = new Set([95, 96, 99]);

function normalize(value) {
    return String(value || '').trim().toLowerCase().replace(/\s+/g, '-');
}

function getLocationKey(location, country) {
    const normalizedLocation = normalize(location);
    const normalizedCountry = normalize(country);
    if (!normalizedLocation && !normalizedCountry) return null;
    return `${normalizedLocation}|${normalizedCountry}`;
}

function getStorageKey(locationKey) {
    return `${CACHE_KEY_PREFIX}${locationKey}`;
}

function getCachedFromMemory(locationKey) {
    const entry = memoryCache.get(locationKey);
    if (!entry) return null;
    if (entry.expiresAt <= Date.now()) {
        memoryCache.delete(locationKey);
        return null;
    }
    return entry.data;
}

function setCachedToMemory(locationKey, data, ttlMs = CACHE_TTL_MS) {
    memoryCache.set(locationKey, { data, expiresAt: Date.now() + ttlMs });
}

function getCachedFromStorage(locationKey) {
    if (typeof window === 'undefined') return null;
    try {
        const raw = window.localStorage.getItem(getStorageKey(locationKey));
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || parsed.expiresAt <= Date.now()) {
            window.localStorage.removeItem(getStorageKey(locationKey));
            return null;
        }
        return parsed.data || null;
    } catch {
        return null;
    }
}

function setCachedToStorage(locationKey, data, ttlMs = CACHE_TTL_MS) {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(
            getStorageKey(locationKey),
            JSON.stringify({ data, expiresAt: Date.now() + ttlMs }),
        );
    } catch {
        // Ignore storage quota and privacy mode failures.
    }
}

function mapWeatherCondition(weatherCode, windSpeed) {
    const wind = Number.isFinite(windSpeed) ? windSpeed : 0;
    if (wind >= 28) return { label: 'Windy', icon: 'windy' };
    if (SNOW_CODES.has(weatherCode)) return { label: 'Snowy', icon: 'snowy' };
    if (RAIN_CODES.has(weatherCode)) return { label: 'Rainy', icon: 'rainy' };
    if (FOG_CODES.has(weatherCode)) return { label: 'Foggy', icon: 'cloudy' };
    if (STORM_CODES.has(weatherCode)) return { label: 'Stormy', icon: 'rainy' };
    if (weatherCode === 0) return { label: 'Sunny', icon: 'sunny' };
    if (weatherCode === 1 || weatherCode === 2) return { label: 'Partly Cloudy', icon: 'cloudy' };
    if (weatherCode === 3) return { label: 'Cloudy', icon: 'cloudy' };
    return { label: 'Clear', icon: 'sunny' };
}

function normalizeConditionByTemperature(condition, temperature) {
    if (!Number.isFinite(temperature)) return condition;

    if (temperature <= 2 && condition !== 'Snowy') return 'Freezing';
    if (temperature <= 10 && ['Sunny', 'Clear', 'Partly Cloudy'].includes(condition)) return 'Cold';
    if (temperature >= 34 && ['Sunny', 'Clear'].includes(condition)) return 'Hot';
    return condition;
}

async function fetchWeather(location, country) {
    const locationText = String(location || '').trim();
    const countryText = String(country || '').trim();
    const firstLocationPart = locationText.split(',')[0]?.trim() || '';
    const candidates = [
        `${firstLocationPart} ${countryText}`.trim(),
        `${locationText} ${countryText}`.trim(),
        countryText,
    ].filter(Boolean);

    let first = null;
    for (const candidate of [...new Set(candidates)]) {
        const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(candidate)}&count=1&language=en&format=json`;
        const geocodeRes = await fetch(geocodeUrl, { cache: 'no-store' });
        if (!geocodeRes.ok) continue;
        const geocode = await geocodeRes.json();
        first = geocode?.results?.[0] || null;
        if (first) break;
    }

    if (!first) return null;

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${first.latitude}&longitude=${first.longitude}&current=temperature_2m,weather_code,wind_speed_10m`;
    const weatherRes = await fetch(weatherUrl, { cache: 'no-store' });
    if (!weatherRes.ok) return null;
    const weatherJson = await weatherRes.json();

    const code = Number(weatherJson?.current?.weather_code);
    const temperature = Number(weatherJson?.current?.temperature_2m);
    const windSpeed = Number(weatherJson?.current?.wind_speed_10m);
    const condition = mapWeatherCondition(code, windSpeed);
    const normalizedCondition = normalizeConditionByTemperature(condition.label, temperature);

    return {
        condition: normalizedCondition,
        icon: condition.icon,
        temperature: Number.isFinite(temperature) ? Math.round(temperature) : null,
        updatedAt: Date.now(),
    };
}

export async function getCachedWeather(location, country) {
    const locationKey = getLocationKey(location, country);
    if (!locationKey) return null;

    const memoryData = getCachedFromMemory(locationKey);
    if (memoryData) return memoryData;

    const storageData = getCachedFromStorage(locationKey);
    if (storageData) {
        setCachedToMemory(locationKey, storageData);
        return storageData;
    }

    if (inFlightRequests.has(locationKey)) {
        return inFlightRequests.get(locationKey);
    }

    const request = fetchWeather(location, country)
        .then((data) => {
            if (data) {
                setCachedToMemory(locationKey, data);
                setCachedToStorage(locationKey, data);
            }
            return data;
        })
        .catch(() => null)
        .finally(() => {
            inFlightRequests.delete(locationKey);
        });

    inFlightRequests.set(locationKey, request);
    return request;
}

const CACHE_TTL_MS = 8 * 60 * 60 * 1000;
const CACHE_KEY_PREFIX = 'travelative-weather-v4:';

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
    // Split "Manali, Himachal Pradesh" → ["Manali", "Himachal Pradesh"]
    const locationParts = locationText.split(',').map((p) => p.trim()).filter(Boolean);
    const firstLocationPart = locationParts[0] || '';
    // Build search string like "Manali Himachal Pradesh" (all parts, spaces instead of commas)
    const fullLocationJoined = locationParts.join(' ');

    const candidates = [
        // Most specific first: "Manali Himachal Pradesh India"
        `${fullLocationJoined} ${countryText}`.trim(),
        // Full comma string: "Manali, Himachal Pradesh"
        locationText,
        // Just the joined location: "Manali Himachal Pradesh"
        fullLocationJoined,
        // First part + country: "Manali India"
        `${firstLocationPart} ${countryText}`.trim(),
        // Just the first part: "Manali"
        firstLocationPart,
        // Last resort: just the country
        countryText,
    ].filter(Boolean);

    let first = null;
    for (const candidate of [...new Set(candidates)]) {
        const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(candidate)}&count=10&language=en&format=json`;
        const geocodeRes = await fetch(geocodeUrl, { cache: 'no-store' });
        if (!geocodeRes.ok) continue;

        const geocode = await geocodeRes.json();
        const results = geocode?.results || [];

        if (results.length > 0) {
            if (countryText) {
                // Filter results that match the requested country
                const countryMatches = results.filter(
                    (r) => r.country?.toLowerCase() === countryText.toLowerCase()
                );
                if (countryMatches.length > 0) {
                    // If admin entered a state (2nd part of location like "Manali, Himachal Pradesh"),
                    // try to match against the 'admin1' field returned by the API.
                    // This gives 100% accurate result without any guesswork.
                    const stateHint = locationParts[1] || '';
                    if (stateHint) {
                        const stateMatch = countryMatches.find(
                            (r) => r.admin1?.toLowerCase().includes(stateHint.toLowerCase())
                        );
                        if (stateMatch) {
                            first = stateMatch;
                            break;
                        }
                    }

                    // No exact state match — fall back to highest-elevation result.
                    // This avoids low-lying namesakes (e.g. Manali, Tamil Nadu @6m)
                    // beating the mountain destination (Manali, Himachal @2108m).
                    first = countryMatches.reduce(
                        (best, r) => ((r.elevation || 0) > (best.elevation || 0) ? r : best),
                        countryMatches[0]
                    );
                    break;
                }
            } else {
                // No country specified — just pick highest elevation
                first = results.reduce(
                    (best, r) => ((r.elevation || 0) > (best.elevation || 0) ? r : best),
                    results[0]
                );
                break;
            }
        }
    }

    // Fallback: If no exact country match, but we have some results from the very last candidate (usually just the country), use its first result.
    if (!first) {
        const fallbackUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(countryText || firstLocationPart)}&count=1&language=en&format=json`;
        const fallbackRes = await fetch(fallbackUrl, { cache: 'no-store' });
        if (fallbackRes.ok) {
            const fallbackGeocode = await fallbackRes.json();
            first = fallbackGeocode?.results?.[0] || null;
        }
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

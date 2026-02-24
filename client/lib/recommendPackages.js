const VIBE_TAGS = {
    mountains: ['mountains', 'mountain', 'hills', 'hill', 'valley', 'trek', 'trekking'],
    beaches: ['beach', 'beaches', 'island', 'coast', 'coastal', 'sea', 'shore'],
    snowfall: ['snow', 'snowfall', 'winter', 'ski', 'glacier'],
    heritage: ['heritage', 'culture', 'historical', 'history', 'fort', 'palace', 'temple'],
    wildlife: ['wildlife', 'safari', 'jungle', 'forest', 'national park'],
    adventure: ['adventure', 'rafting', 'paragliding', 'camping', 'biking', 'hiking'],
};

const CLOSE_VIBE_FALLBACKS = {
    mountains: ['adventure', 'wildlife'],
    beaches: ['relax', 'adventure'],
    snowfall: ['mountains', 'heritage'],
    heritage: ['mountains', 'family'],
    wildlife: ['adventure', 'mountains'],
    adventure: ['mountains', 'wildlife'],
};

const TRAVELER_TAGS = {
    couple: ['couple', 'romance', 'romantic', 'privacy', 'honeymoon'],
    family: ['family', 'kid-friendly', 'kids', 'sightseeing'],
    solo: ['solo', 'peace', 'meditation', 'spiritual', 'backpacking'],
    friends: ['friends', 'group', 'nightlife', 'adventure', 'backpacking'],
};

const AVAILABILITY_RANGES = {
    short: { min: 1, max: 3, label: 'Up to 3 days' },
    week: { min: 4, max: 7, label: '4 to 7 days' },
    ten_days: { min: 8, max: 10, label: '8 to 10 days' },
    long: { min: 10, max: 60, label: '10+ days' },
};

const DEFAULT_BUDGET_RANGES = {
    budget_25k: { min: 0, max: 25000, label: 'Up to INR 25,000' },
    budget_50k: { min: 25001, max: 50000, label: 'INR 25,001 to INR 50,000' },
    budget_1l: { min: 50001, max: 100000, label: 'INR 50,001 to INR 1,00,000' },
    budget_1l_plus: { min: 100001, max: Number.MAX_SAFE_INTEGER, label: 'INR 1,00,000+' },
};

function normalize(value = '') {
    return String(value).trim().toLowerCase();
}

function parseDurationDays(duration) {
    if (!duration) return null;
    const text = String(duration);
    const dayMatch = text.match(/(\d+)\s*day/i);
    if (dayMatch) return Number(dayMatch[1]);
    const anyNumberMatch = text.match(/(\d+)/);
    return anyNumberMatch ? Number(anyNumberMatch[1]) : null;
}

function getPackageTags(pkg) {
    const tags = new Set();
    const push = (item) => {
        if (!item) return;
        tags.add(normalize(item));
    };

    (pkg.tags || []).forEach(push);
    push(pkg.category);
    push(pkg.location);
    push(pkg.country);

    return Array.from(tags);
}

function getDurationDays(pkg) {
    const numericDuration = Number(pkg.durationDays);
    if (Number.isFinite(numericDuration) && numericDuration > 0) return numericDuration;
    return parseDurationDays(pkg.duration);
}

function isDomestic(pkg) {
    const locationType = normalize(pkg.locationType);
    if (locationType === 'domestic') return true;
    if (locationType === 'international') return false;
    return normalize(pkg.country) === 'india';
}

function isVibeMatch(pkgTags, vibeKey) {
    const expectedTags = VIBE_TAGS[vibeKey] || [];
    return expectedTags.some((tag) => pkgTags.includes(tag));
}

function isTravelerMatch(pkg, travelerType, pkgTags) {
    const travelerTypes = Array.isArray(pkg.travelerTypes)
        ? pkg.travelerTypes.map((item) => normalize(item))
        : [];

    if (travelerTypes.includes(travelerType)) {
        return { matched: true, reason: `Designed for ${travelerType} travel`, score: 22 };
    }

    const travelerHints = TRAVELER_TAGS[travelerType] || [];
    if (travelerHints.some((hint) => pkgTags.includes(hint))) {
        return { matched: true, reason: `Good fit for ${travelerType} trips`, score: 14 };
    }

    return { matched: false, reason: '', score: 0 };
}

function resolveBudgetRange(budgetValue) {
    if (!budgetValue) return null;

    // Dynamic budget values from UI: "min-max"
    if (budgetValue.includes('-')) {
        const [minRaw, maxRaw] = budgetValue.split('-');
        const min = Number(minRaw);
        const max = Number(maxRaw);
        if (Number.isFinite(min) && Number.isFinite(max)) {
            return { min, max };
        }
    }

    // Backward compatibility with old static keys
    return DEFAULT_BUDGET_RANGES[budgetValue] || null;
}

function getBudgetScore(budgetValue, price) {
    if (!budgetValue || !Number.isFinite(price)) return { score: 0, reason: '' };
    const range = resolveBudgetRange(budgetValue);
    if (!range) return { score: 0, reason: '' };

    if (price >= range.min && price <= range.max) {
        return { score: 20, reason: 'Budget aligned' };
    }

    if (price > range.max && price <= range.max * 1.2) {
        return { score: 8, reason: 'Slightly above budget' };
    }

    if (price < range.min) {
        return { score: 5, reason: 'Under budget' };
    }

    return { score: 0, reason: '' };
}

function getDurationScore(availabilityKey, durationDays) {
    if (!availabilityKey || !durationDays) return { score: 0, reason: '' };
    const range = AVAILABILITY_RANGES[availabilityKey];
    if (!range) return { score: 0, reason: '' };

    if (durationDays >= range.min && durationDays <= range.max) {
        return { score: 12, reason: `Duration fit (${range.label})` };
    }

    if (durationDays < range.min && range.min - durationDays <= 2) {
        return { score: 5, reason: 'Near your preferred duration' };
    }

    if (durationDays > range.max && durationDays - range.max <= 2) {
        return { score: 4, reason: 'Slightly longer than preferred' };
    }

    return { score: 0, reason: '' };
}

function scorePackage(pkg, answers, mode = 'exact') {
    const pkgTags = getPackageTags(pkg);
    const travelerType = normalize(answers?.travelerType);
    const vibe = normalize(answers?.vibe);
    const destination = normalize(answers?.destination);
    const availability = normalize(answers?.availability);
    const budget = String(answers?.budget || '');

    let score = 0;
    const reasons = [];

    if (travelerType) {
        const travelerResult = isTravelerMatch(pkg, travelerType, pkgTags);
        score += travelerResult.score;
        if (travelerResult.reason) reasons.push(travelerResult.reason);
    }

    if (vibe) {
        if (isVibeMatch(pkgTags, vibe)) {
            score += 50;
            reasons.push(`Exact ${vibe} vibe match`);
        } else if (mode === 'relaxed') {
            const closeVibes = CLOSE_VIBE_FALLBACKS[vibe] || [];
            const hasCloseVibe = closeVibes.some((closeVibe) => isVibeMatch(pkgTags, closeVibe));
            if (hasCloseVibe) {
                score += 20;
                reasons.push('Closest available vibe match');
            }
        }
    }

    if (destination === 'india' || destination === 'abroad') {
        const domestic = isDomestic(pkg);
        const destinationMatch = (destination === 'india' && domestic) || (destination === 'abroad' && !domestic);
        if (destinationMatch) {
            score += 30;
            reasons.push(destination === 'india' ? 'Domestic match' : 'International match');
        }
    }

    const durationResult = getDurationScore(availability, getDurationDays(pkg));
    score += durationResult.score;
    if (durationResult.reason) reasons.push(durationResult.reason);

    const budgetResult = getBudgetScore(budget, Number(pkg.price));
    score += budgetResult.score;
    if (budgetResult.reason) reasons.push(budgetResult.reason);

    if (pkg.isFeatured || pkg.isTrending) {
        score += 5;
        reasons.push('Popular pick');
    }

    if (typeof pkg.rating === 'number') {
        score += Math.min(pkg.rating, 5);
    }

    return {
        ...pkg,
        matchScore: score,
        matchReasons: reasons.slice(0, 3),
    };
}

export function recommendPackages(packages, answers, limit = 3) {
    if (!Array.isArray(packages) || packages.length === 0) {
        return { results: [], isFallback: false, fallbackMessage: '' };
    }

    const vibe = normalize(answers?.vibe);
    const exactPool = vibe
        ? packages.filter((pkg) => isVibeMatch(getPackageTags(pkg), vibe))
        : packages;

    const exactRanked = exactPool
        .map((pkg) => scorePackage(pkg, answers, 'exact'))
        .sort((a, b) => {
            if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
            return (b.rating || 0) - (a.rating || 0);
        });

    if (exactRanked.length > 0) {
        return {
            results: exactRanked.slice(0, limit),
            isFallback: false,
            fallbackMessage: '',
        };
    }

    const relaxedRanked = packages
        .map((pkg) => scorePackage(pkg, answers, 'relaxed'))
        .sort((a, b) => {
            if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
            return (b.rating || 0) - (a.rating || 0);
        });

    return {
        results: relaxedRanked.slice(0, limit),
        isFallback: true,
        fallbackMessage: 'We could not find an exact match. These are the closest options based on your preferences.',
    };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function getAuthHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : '';

    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

async function saveBlobResponse(response, fallbackFileName) {
    if (!response.ok) {
        let message = 'Unable to download the itinerary PDF.';

        try {
            const data = await response.json();
            message = data.message || message;
        } catch {}

        throw new Error(message);
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fallbackFileName || 'travelative-itinerary.pdf';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(blobUrl);
}

export async function downloadAdminItineraryPdf(itineraryPayload, fileName) {
    const response = await fetch(`${API_URL}/api/admin/itineraries/download`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(itineraryPayload),
    });

    await saveBlobResponse(response, fileName);
}

export async function downloadSavedItineraryPdf(itineraryId, fileName) {
    if (!itineraryId) {
        throw new Error('Itinerary ID is required for downloading.');
    }

    const response = await fetch(`${API_URL}/api/admin/itineraries/${itineraryId}/download`, {
        headers: getAuthHeaders(),
        credentials: 'include',
    });

    await saveBlobResponse(response, fileName);
}

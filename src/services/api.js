const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const reportUser = async (reportData) => {
    try {
        const response = await fetch(`${API_URL}/api/reports`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reportData),
        });
        return await response.json();
    } catch (error) {
        console.error('Error reporting user:', error);
        throw error;
    }
};

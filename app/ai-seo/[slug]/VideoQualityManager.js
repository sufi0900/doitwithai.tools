// VideoQualityManager.js
export const getOptimalQuality = (connection) => {
    if (!connection) return '720p';
    
    const speed = connection.downlink;
    if (speed >= 10) return '1080p';
    if (speed >= 5) return '720p';
    if (speed >= 2) return '480p';
    return '360p';
  }
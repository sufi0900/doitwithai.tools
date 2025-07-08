// "use client";
// import { useState, useEffect } from 'react';
// import { useCacheContext } from '@/React_Query_Caching/CacheProvider';

// export default function OfflineIndicator() {
//   const [isOnline, setIsOnline] = useState(true);
//   const { isOnline: contextIsOnline } = useCacheContext();

//   useEffect(() => {
//     const handleOnline = () => setIsOnline(true);
//     const handleOffline = () => setIsOnline(false);

//     window.addEventListener('online', handleOnline);
//     window.addEventListener('offline', handleOffline);

//     // Initial check
//     setIsOnline(navigator.onLine);

//     return () => {
//       window.removeEventListener('online', handleOnline);
//       window.removeEventListener('offline', handleOffline);
//     };
//   }, []);

//   if (isOnline && contextIsOnline) return null;

//   return (
//     <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-black text-center py-2 z-50">
//       <p>You're offline. Showing cached content.</p>
//     </div>
//   );
// }
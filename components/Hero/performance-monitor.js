class PerformanceMonitor {
  constructor() {
    this.metrics = {
      lcp: null,
      fcp: null,
      cls: null,
      fid: null,
      ttfb: null
    };
    this.observers = [];
  }

  // Initialize all performance observers
  init() {
    if (typeof window === 'undefined') return;
    
    this.observeLCP();
    this.observeFCP();
    this.observeCLS();
    this.observeFID();
    this.observeTTFB();
  }

  // Largest Contentful Paint
  observeLCP() {
    if (!('PerformanceObserver' in window)) return;
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      this.metrics.lcp = lastEntry.startTime;
      this.reportMetric('LCP', lastEntry.startTime);
    });
    
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
    this.observers.push(observer);
  }

  // First Contentful Paint
  observeFCP() {
    if (!('PerformanceObserver' in window)) return;
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
      
      if (fcpEntry) {
        this.metrics.fcp = fcpEntry.startTime;
        this.reportMetric('FCP', fcpEntry.startTime);
      }
    });
    
    observer.observe({ entryTypes: ['paint'] });
    this.observers.push(observer);
  }

  // Cumulative Layout Shift
  observeCLS() {
    if (!('PerformanceObserver' in window)) return;
    
    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      
      this.metrics.cls = clsValue;
      this.reportMetric('CLS', clsValue);
    });
    
    observer.observe({ entryTypes: ['layout-shift'] });
    this.observers.push(observer);
  }

  // First Input Delay
  observeFID() {
    if (!('PerformanceObserver' in window)) return;
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const firstEntry = entries[0];
      
      if (firstEntry) {
        this.metrics.fid = firstEntry.processingStart - firstEntry.startTime;
        this.reportMetric('FID', this.metrics.fid);
      }
    });
    
    observer.observe({ entryTypes: ['first-input'] });
    this.observers.push(observer);
  }

  // Time to First Byte
  observeTTFB() {
    if (!('PerformanceObserver' in window)) return;
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const navigationEntry = entries.find(entry => entry.entryType === 'navigation');
      
      if (navigationEntry) {
        this.metrics.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
        this.reportMetric('TTFB', this.metrics.ttfb);
      }
    });
    
    observer.observe({ entryTypes: ['navigation'] });
    this.observers.push(observer);
  }

  // Report individual metrics
  reportMetric(name, value) {
    console.log(`📊 ${name}: ${value.toFixed(2)}ms`);
    
    // Send to analytics (implement your preferred analytics)
    this.sendToAnalytics(name, value);
  }

  // Send metrics to analytics service
  sendToAnalytics(name, value) {
    // Implement your analytics service here
    // Example: Google Analytics, Mixpanel, etc.
    if (typeof gtag !== 'undefined') {
      gtag('event', 'web_vitals', {
        event_category: 'Performance',
        event_label: name,
        value: Math.round(value)
      });
    }
  }

  // Get current metrics snapshot
  getMetrics() {
    return { ...this.metrics };
  }

  // Clean up observers
  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

export default PerformanceMonitor;

export const cacheTestHelper = {
  // Test Redis functionality
  async testRedisCache(slug, schemaType) {
    const cacheKey = `article:${schemaType}:${slug}`;
    
    console.log('=== Redis Cache Test ===');
    
    // Clear Redis cache
    await redisHelpers.del(cacheKey);
    console.log('1. Redis cache cleared');
    
    // First fetch (should hit Sanity)
    const startTime1 = Date.now();
    const data1 = await getCompleteArticleData(slug, schemaType);
    const time1 = Date.now() - startTime1;
    console.log(`2. First fetch: ${time1}ms (should be slow, from Sanity)`);
    
    // Second fetch (should hit Redis)
    const startTime2 = Date.now();
    const data2 = await getCompleteArticleData(slug, schemaType);
    const time2 = Date.now() - startTime2;
    console.log(`3. Second fetch: ${time2}ms (should be fast, from Redis)`);
    
    // Verify data consistency
    const isConsistent = JSON.stringify(data1) === JSON.stringify(data2);
    console.log(`4. Data consistency: ${isConsistent ? 'PASS' : 'FAIL'}`);
    
    return {
      firstFetchTime: time1,
      secondFetchTime: time2,
      speedImprovement: `${Math.round((time1 / time2) * 100) / 100}x faster`,
      dataConsistent: isConsistent
    };
  },

  // Test memory cache functionality
  testMemoryCache() {
    console.log('=== Memory Cache Test ===');
    const stats = cacheSystem.getCacheStats();
    console.log('Memory cache stats:', stats);
    
    return stats;
  },

  // Test complete flow
  async testCompleteFlow(slug, schemaType) {
    console.log('=== Complete Cache Flow Test ===');
    
    // Test server-side Redis
    const redisTest = await this.testRedisCache(slug, schemaType);
    console.log('Redis test results:', redisTest);
    
    // Test client-side memory cache
    const memoryTest = this.testMemoryCache();
    console.log('Memory test results:', memoryTest);
    
    return {
      redis: redisTest,
      memory: memoryTest,
      recommendation: redisTest.speedImprovement > 2 ? 
        'Redis is providing significant performance benefits' :
        'Consider checking Redis configuration'
    };
  }
};

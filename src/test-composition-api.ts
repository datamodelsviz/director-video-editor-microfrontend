// Simple test file to verify API integration
import { compositionApi } from './services/compositionApi';

async function testCompositionAPI() {
  console.log('Testing Composition API...');
  
  try {
    // Test listing compositions
    console.log('1. Testing listCompositions...');
    const listResponse = await compositionApi.listCompositions();
    console.log('List response:', listResponse);
    
    // Test creating a composition
    console.log('2. Testing createComposition...');
    const testComposition = {
      name: 'Test Composition',
      description: 'A test composition for API testing',
      duration: 5000,
      fps: 30,
      size: { width: 1080, height: 1920 },
      tracks_count: 0,
      is_public: false,
      category: 'test',
      tags: ['test'],
      design: {
        id: 'test-design-123',
        size: { width: 1080, height: 1920 },
        fps: 30,
        tracks: [],
        trackItemIds: [],
        trackItemsMap: {},
        transitionIds: [],
        transitionsMap: {},
        scale: { index: 7, unit: 300, zoom: 0.0033333333333333335, segments: 5 },
        duration: 5000,
        activeIds: [],
        structure: [],
        background: { type: 'color' as const, value: 'transparent' }
      },
      options: {
        fps: 30,
        size: { width: 1080, height: 1920 },
        format: 'mp4'
      }
    };
    
    const createResponse = await compositionApi.createComposition(testComposition);
    console.log('Create response:', createResponse);
    
    if (createResponse.success && createResponse.data.composition) {
      const compositionId = createResponse.data.composition.id;
      
      // Test getting the composition
      console.log('3. Testing getComposition...');
      const getResponse = await compositionApi.getComposition(compositionId);
      console.log('Get response:', getResponse);
    }
    
    console.log('✅ All API tests completed successfully!');
    
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
}

// Export for testing
export { testCompositionAPI };

// Run if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment - don't run automatically
  console.log('Composition API test available. Call testCompositionAPI() to run tests.');
} else {
  // Node environment - run automatically
  testCompositionAPI();
}

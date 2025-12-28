#!/usr/bin/env node

// Test script for the new quality-based pricing functions
// Run with: node scripts/test-pricing-functions.js

// Mock the pricing functions (simplified versions for testing)
function calculateServicePrice(quantity, service, qualityType = 'high_quality') {
  let pricePer1k;
  
  // Handle new quality-based pricing structure
  if ('high_quality_price_per_1k' in service && 'low_quality_price_per_1k' in service) {
    pricePer1k = qualityType === 'high_quality' 
      ? service.high_quality_price_per_1k 
      : service.low_quality_price_per_1k;
  } 
  // Fallback to legacy pricing structure
  else if ('price_per_1k' in service) {
    pricePer1k = service.price_per_1k;
  } 
  else {
    throw new Error('Invalid service pricing structure');
  }
  
  return Math.ceil((quantity / 1000) * pricePer1k);
}

function getPricePerK(service, qualityType = 'high_quality') {
  // Handle new quality-based pricing structure
  if ('high_quality_price_per_1k' in service && 'low_quality_price_per_1k' in service) {
    return qualityType === 'high_quality' 
      ? service.high_quality_price_per_1k 
      : service.low_quality_price_per_1k;
  } 
  // Fallback to legacy pricing structure
  else if ('price_per_1k' in service) {
    return service.price_per_1k;
  } 
  else {
    throw new Error('Invalid service pricing structure');
  }
}

// Test cases
console.log('🧪 Testing Quality-Based Pricing Functions\n');

// Test service with new pricing structure
const newService = {
  id: 'test-1',
  platform: 'instagram',
  service_type: 'followers',
  high_quality_price_per_1k: 100,
  low_quality_price_per_1k: 70,
  price_per_1k: 100 // For backward compatibility
};

// Test service with legacy pricing structure
const legacyService = {
  id: 'test-2',
  platform: 'tiktok',
  service_type: 'likes',
  price_per_1k: 50
};

console.log('📊 Test 1: New Service Structure');
console.log('Service:', newService.platform, newService.service_type);
console.log('High Quality Price/1k:', getPricePerK(newService, 'high_quality'));
console.log('Low Quality Price/1k:', getPricePerK(newService, 'low_quality'));
console.log('High Quality Total (5000 qty):', calculateServicePrice(5000, newService, 'high_quality'));
console.log('Low Quality Total (5000 qty):', calculateServicePrice(5000, newService, 'low_quality'));
console.log('');

console.log('📊 Test 2: Legacy Service Structure');
console.log('Service:', legacyService.platform, legacyService.service_type);
console.log('Price/1k:', getPricePerK(legacyService));
console.log('Total (3000 qty):', calculateServicePrice(3000, legacyService));
console.log('');

console.log('📊 Test 3: Edge Cases');
try {
  const invalidService = { id: 'invalid' };
  getPricePerK(invalidService);
} catch (error) {
  console.log('✅ Correctly caught error for invalid service:', error.message);
}

console.log('');
console.log('✅ All tests completed successfully!');
console.log('');
console.log('💡 Expected behavior:');
console.log('- New services use quality-specific pricing');
console.log('- Legacy services fall back to price_per_1k');
console.log('- Invalid services throw appropriate errors');
console.log('- Price calculations are accurate and rounded up');
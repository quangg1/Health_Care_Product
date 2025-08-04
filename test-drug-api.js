const axios = require('axios');

const API_BASE_URL = 'http://localhost:8080/api/v1';

// Test drug API endpoints
async function testDrugAPI() {
  console.log('🧪 Testing Drug API Endpoints...\n');

  try {
    // Test 1: Get all drugs
    console.log('1. Testing GET /drugs (all drugs)...');
    const drugsResponse = await axios.get(`${API_BASE_URL}/drugs`);
    console.log('✅ Status:', drugsResponse.status);
    console.log('✅ Data count:', drugsResponse.data.data?.length || 0);
    console.log('✅ Pagination:', drugsResponse.data.pagination);
    console.log('');

    // Test 2: Get drug categories
    console.log('2. Testing GET /drugs/categories/all...');
    const categoriesResponse = await axios.get(`${API_BASE_URL}/drugs/categories/all`);
    console.log('✅ Status:', categoriesResponse.status);
    console.log('✅ Categories count:', categoriesResponse.data.data?.length || 0);
    console.log('✅ Categories:', categoriesResponse.data.data?.slice(0, 3).map(c => `${c.name} (${c.count})`));
    console.log('');

    // Test 3: Search drugs
    console.log('3. Testing GET /drugs with search...');
    const searchResponse = await axios.get(`${API_BASE_URL}/drugs`, {
      params: { search: 'paracetamol', limit: 5 }
    });
    console.log('✅ Status:', searchResponse.status);
    console.log('✅ Search results count:', searchResponse.data.data?.length || 0);
    console.log('');

    // Test 4: Get drug by ID (if drugs exist)
    if (drugsResponse.data.data && drugsResponse.data.data.length > 0) {
      const firstDrugId = drugsResponse.data.data[0]._id;
      console.log('4. Testing GET /drugs/:id...');
      const drugResponse = await axios.get(`${API_BASE_URL}/drugs/${firstDrugId}`);
      console.log('✅ Status:', drugResponse.status);
      console.log('✅ Drug name:', drugResponse.data.data?.tenThuoc);
      console.log('✅ Drug registration:', drugResponse.data.data?.soDangKy);
      console.log('');
    }

    // Test 5: Test pagination
    console.log('5. Testing pagination...');
    const pageResponse = await axios.get(`${API_BASE_URL}/drugs`, {
      params: { page: 1, limit: 3 }
    });
    console.log('✅ Status:', pageResponse.status);
    console.log('✅ Page 1 results:', pageResponse.data.data?.length || 0);
    console.log('✅ Total pages:', pageResponse.data.pagination?.totalPages);
    console.log('');

    console.log('🎉 All Drug API tests PASSED!');
    console.log('\n📊 Summary:');
    console.log(`- Total drugs in database: ${drugsResponse.data.pagination?.totalItems || 0}`);
    console.log(`- Total categories: ${categoriesResponse.data.data?.length || 0}`);
    console.log(`- API is working correctly`);

  } catch (error) {
    console.error('❌ Drug API test FAILED:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      console.log('\n💡 Hint: Make sure the backend server is running on port 8080');
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Hint: Backend server is not running. Start it with: npm start');
    }
  }
}

// Test if backend is running
async function testBackendConnection() {
  try {
    console.log('🔍 Testing backend connection...');
    const response = await axios.get(`${API_BASE_URL}/drugs`);
    console.log('✅ Backend is running and accessible');
    return true;
  } catch (error) {
    console.error('❌ Backend connection failed:', error.message);
    console.log('\n💡 Please start the backend server first:');
    console.log('   cd Health_Care_Product');
    console.log('   npm start');
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Drug API Tests...\n');
  
  const backendRunning = await testBackendConnection();
  if (!backendRunning) {
    return;
  }
  
  await testDrugAPI();
}

// Run tests
runTests().catch(console.error); 
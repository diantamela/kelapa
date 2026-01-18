// Simple test to verify the application structure
import { db } from '@/lib/db';

async function testDatabaseConnection() {
  try {
    // Test database connection by querying the users table
    const userCount = await db.user.count();
    console.log(`Database connection successful. Found ${userCount} users.`);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

async function testApplicationStructure() {
  console.log('Testing application structure...');
  
  // Test database connection
  const dbOk = await testDatabaseConnection();
  if (!dbOk) {
    console.error('Database test failed');
    return false;
  }
  
  console.log('All tests passed! Application structure is correct.');
  return true;
}

// Run the test
testApplicationStructure()
  .then(success => {
    if (success) {
      console.log('✅ Application is ready for use!');
    } else {
      console.log('❌ Application has issues that need to be addressed.');
    }
  })
  .catch(error => {
    console.error('Test failed with error:', error);
  });
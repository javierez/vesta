import mysql from 'mysql2/promise';

async function testConnection() {
  console.log('Testing database connection...');
  
  const config = {
    host: 'svc-554a48e0-adba-44d4-80e9-f368c0f377c3-dml.aws-oregon-4.svc.singlestore.com',
    port: 3306,
    user: 'admin',
    password: 'b6YVBnTjt0~3ftd5;g}6i@G',
    database: 'vesta',
    ssl: {
      rejectUnauthorized: false,
    },
    connectTimeout: 60000,
    acquireTimeout: 60000,
    timeout: 60000,
  };

  try {
    console.log('Attempting to connect with config:', {
      ...config,
      password: '***HIDDEN***'
    });
    
    const connection = await mysql.createConnection(config);
    console.log('✅ Connected to database successfully!');
    
    // Test a simple query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Test query successful:', rows);
    
    await connection.end();
    console.log('✅ Connection closed successfully');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error errno:', error.errno);
  }
}

testConnection();
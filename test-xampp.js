// Test XAMPP MySQL Connection
const mysql = require('mysql2/promise');

async function testXAMPP() {
    console.log('Testing XAMPP MySQL connection...');
    
    // Try multiple connection configurations
    const configs = [
        {
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'checkmate_srms'
        },
        {
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'checkmate_srms',
            authSwitchHandler: ({ pluginName, pluginData }) => {
                // Handle authentication switch
                return null;
            }
        },
        {
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'checkmate_srms',
            charset: 'utf8mb4',
            supportBigNumbers: true,
            bigNumberStrings: true
        }
    ];
    
    for (let i = 0; i < configs.length; i++) {
        const config = configs[i];
        console.log(`\nTrying configuration ${i + 1}...`);
        
        try {
            const connection = await mysql.createConnection(config);
            console.log('✅ Connection successful!');
            
            // Test basic query
            const [rows] = await connection.execute('SELECT 1 as test');
            console.log('✅ Query test passed:', rows[0]);
            
            // Create database if not exists
            await connection.execute('CREATE DATABASE IF NOT EXISTS checkmate_srms');
            console.log('✅ Database created/verified');
            
            await connection.end();
            
            console.log('\n🎉 XAMPP MySQL is working!');
            return true;
            
        } catch (error) {
            console.log(`❌ Configuration ${i + 1} failed:`, error.message);
        }
    }
    
    console.log('\n❌ All configurations failed.');
    console.log('\nTroubleshooting steps:');
    console.log('1. Make sure XAMPP MySQL service is running');
    console.log('2. Try resetting MySQL root password in XAMPP');
    console.log('3. Check if port 3306 is available');
    console.log('4. Restart XAMPP MySQL service');
    
    return false;
}

testXAMPP();

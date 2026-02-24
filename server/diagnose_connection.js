const http = require('http');

console.log("---------------------------------------------------");
console.log("DIAGNOSTIC TEST STARTING");
console.log("---------------------------------------------------");

// 1. Check if Server is reachable
const checkServer = () => {
    console.log("1. Checking connection to Backend (http://localhost:5000)...");
    const req = http.get('http://localhost:5000/', (res) => {
        console.log(`   [SUCCESS] Server responded with Status Code: ${res.statusCode}`);

        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            console.log(`   [SUCCESS] Response Body: "${data}"`);
            checkLogin();
        });
    });

    req.on('error', (err) => {
        console.log("   [FAILURE] Could not connect to backend!");
        console.log(`   Error Code: ${err.code}`);
        console.log(`   Error Message: ${err.message}`);
        console.log("\n   POSSIBLE CAUSES:");
        console.log("   - The server is NOT running.");
        console.log("   - The server crashed.");
        console.log("   - The server is running on a different port.");
        console.log("\n   Fix: Switch to your SERVER terminal and check for errors.");
    });
};

// 2. Check Login explicitly
const checkLogin = async () => {
    console.log("\n2. Testing Admin Login...");
    const email = 'priyachaudhari040@gmail.com';
    const password = 'password123';

    const postData = JSON.stringify({ email, password });

    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const req = http.request(options, (res) => {
        console.log(`   [INFO] Login Response Status: ${res.statusCode}`);

        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            if (res.statusCode === 200) {
                console.log("   [SUCCESS] Login WORKING via script!");
                console.log("   This means the issue is likely in the Frontend (CORS or network code).");
            } else {
                console.log("   [FAILURE] Login failed via script.");
                console.log(`   Response: ${data}`);
            }
        });
    });

    req.on('error', (e) => {
        console.error(`   [FAILURE] Problem with request: ${e.message}`);
    });

    req.write(postData);
    req.end();
};

checkServer();

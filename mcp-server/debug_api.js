
const API_URL = "https://apihoma.homa.cl:7200";
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNlYmFzdGlhbi5hbG1vOUBnbWFpbC5jb20iLCJpYXQiOjE3Njk0MDc0OTEsImV4cCI6MTc2OTQ5Mzg5MX0.bXL8leF2aIghM7cxw_aeajb0fp210SZYIUA_7IvdPZE";
const PATIENT_ID = "75863";

async function checkServices() {
    console.log("🔍 Checking Services API...");
    const url = `${API_URL}/api/v1/patients/${PATIENT_ID}/services`;
    console.log(`URL: ${url}`);
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': TOKEN
            }
        });

        console.log(`Status: ${response.status} ${response.statusText}`);
        const text = await response.text();
        console.log("Raw Response:");
        console.log(text.substring(0, 500)); // Print first 500 chars
        
        try {
            const json = JSON.parse(text);
            console.log("Parsed JSON Type:", Array.isArray(json) ? "Array" : typeof json);
            if (!Array.isArray(json)) {
                 console.log("Keys:", Object.keys(json));
            }
        } catch (e) {
            console.log("Response is not JSON");
        }

    } catch (e) {
        console.error("Fetch Error:", e.message);
    }
}

checkServices();

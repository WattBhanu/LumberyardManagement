const axios = require('axios');

async function run() {
    try {
        const loginRes = await axios.post('http://localhost:8081/api/auth/login', {
            username: 'admin@lumberyard.com',
            password: 'password'
        });
        const token = loginRes.data.jwt;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        console.log('Fetching workers stats...');
        const statsRes = await axios.get('http://localhost:8081/api/workers/stats', config);
        console.log('Stats:', statsRes.data);
        
        console.log('Creating a test worker...');
        const createRes = await axios.post('http://localhost:8081/api/workers', {
            firstName: 'EndToEnd',
            lastName: 'Test',
            email: 'end2end' + Date.now() + '@test.com',
            phone: '077' + Math.floor(Math.random() * 10000000),
            position: 'Sawyer',
            department: 'Sawmill',
            status: 'Active',
            hireDate: new Date().toISOString().split('T')[0],
            dateOfBirth: '1990-01-01',
            homeAddress: '123 Lumber St'
        }, config);
        const workerId = createRes.data.id;
        console.log('Created worker ID:', workerId);
        
        console.log('Recording attendance arrival...');
        const date = new Date().toISOString().split('T')[0];
        const attRes = await axios.post('http://localhost:8081/api/attendance', {
            workerId: workerId,
            date: date,
            status: 'Present',
            arrivalTime: '08:00:00'
        }, config);
        console.log('Arrival recorded. ID:', attRes.data.id);
        
        console.log('Recording attendance departure...');
        const depRes = await axios.post('http://localhost:8081/api/attendance', {
            workerId: workerId,
            date: date,
            status: 'Present',
            departureTime: '17:00:00'
        }, config);
        console.log('Departure recorded, worked hours:', depRes.data.workedHours);
        
        console.log('Fetching daily salary...');
        const [yyyy, mm, dd] = date.split('-');
        const salRes = await axios.get(`http://localhost:8081/api/salary/reports/daily?year=${yyyy}&month=${parseInt(mm)}&day=${parseInt(dd)}`, config);
        console.log('Daily Salary Items Length:', salRes.data.items.length);
        const myItem = salRes.data.items.find(i => i.workerName === 'EndToEnd Test');
        if (myItem) {
            console.log('Full Item:', JSON.stringify(myItem, null, 2));
        } else {
            console.log('Test worker not found in salary query!');
        }
        
    } catch (err) {
        console.error('Error:', err.response ? err.response.status + ' - ' + JSON.stringify(err.response.data) : err.message);
    }
}
run();

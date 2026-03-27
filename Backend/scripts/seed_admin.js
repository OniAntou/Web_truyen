const mongoose = require('mongoose');
const { AdminLogin } = require('../../Database/database'); // Adjust path as needed

const dbURI = 'mongodb://localhost:27017/skycomic';

mongoose.connect(dbURI)
    .then(async () => {
        console.log('✅ Connected to MongoDB');

        // Check if admin exists
        const existing = await AdminLogin.findOne({ username: 'admin' });
        if (existing) {
            console.log('Admin user already exists.');
        } else {
            const newAdmin = new AdminLogin({
                username: 'admin',
                password: '123' // Plain text as requested/implemented for now
            });
            await newAdmin.save();
            console.log('✅ Created default admin user: admin / 123');
        }

        mongoose.disconnect();
    })
    .catch(err => {
        console.error('❌ Error:', err);
        process.exit(1);
    });

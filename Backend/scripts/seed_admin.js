const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { AdminLogin } = require('../../Database/database');

const dbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skycomic';

mongoose.connect(dbURI)
    .then(async () => {
        console.log('✅ Connected to MongoDB');

        const username = 'admin';
        const rawPassword = '123';

        // Check if admin exists
        const existing = await AdminLogin.findOne({ username });
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(rawPassword, salt);

        if (existing) {
            console.log('Admin user already exists. Updating password to hashed version...');
            existing.password = hashedPassword;
            await existing.save();
            console.log('✅ Updated admin password.');
        } else {
            const newAdmin = new AdminLogin({
                username,
                password: hashedPassword
            });
            await newAdmin.save();
            console.log(`✅ Created default admin user: ${username} / ${rawPassword} (Hashed)`);
        }

        mongoose.disconnect();
    })
    .catch(err => {
        console.error('❌ Error:', err);
        process.exit(1);
    });

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { AdminLogin } = require('../Database/database');

const dbURI = process.env.MONGO_URI || 'mongodb://localhost:27017/skycomic';

mongoose.connect(dbURI)
    .then(async () => {
        console.log('✅ Connected to MongoDB');

        // Delete existing admin(s)
        await AdminLogin.deleteMany({});
        console.log('🗑️ Deleted all existing admin user(s)');

        const username = 'admin';
        const rawPassword = 'admin123456';
        const email = 'admin@skycomic.com';
        const role = 'superadmin';

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(rawPassword, salt);

        const newAdmin = new AdminLogin({
            username,
            email,
            role,
            password: hashedPassword
        });
        await newAdmin.save();
        console.log(`✅ Created new admin user: ${username} / ${rawPassword} / ${email} / ${role} (Hashed)`);

        mongoose.disconnect();
    })
    .catch(err => {
        console.error('❌ Error:', err);
        process.exit(1);
    });

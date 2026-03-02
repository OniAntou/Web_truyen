const mongoose = require('mongoose');
const { Admin } = require('../Database/database');

const dbURI = 'mongodb://localhost:27017/skycomic';

mongoose.connect(dbURI)
    .then(async () => {
        console.log('✅ Connected');
        const admins = await Admin.find({});
        console.log('Current Admins:', admins);
        mongoose.disconnect();
    })
    .catch(err => console.error(err));

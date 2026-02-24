const mongoose = require('mongoose');
const User = require('./models/User');
const Timetable = require('./models/Timetable');
const dotenv = require('dotenv');

dotenv.config();

const debug = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart_classroom');
        const count = await Timetable.countDocuments();
        console.log(`Total Timetable Records: ${count}`);

        const entries = await Timetable.find({}).lean();
        console.log(JSON.stringify(entries, null, 2));
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debug();

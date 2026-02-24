const mongoose = require('mongoose');
require('dotenv').config();

const Package = require('./models/Package');

async function backfillPackageMetadata() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const packages = await Package.find();
    let updated = 0;

    for (const pkg of packages) {
        // Trigger schema pre-validate enrichments and save normalized metadata.
        await pkg.save();
        updated += 1;
    }

    console.log(`Backfilled metadata for ${updated} packages`);
    process.exit(0);
}

backfillPackageMetadata().catch((err) => {
    console.error('Backfill failed:', err);
    process.exit(1);
});

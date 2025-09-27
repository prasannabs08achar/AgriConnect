import 'dotenv/config';
import connectDB from './db/index.db.js';
import app from './app.js';

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is connected successfully at the port:${process.env.PORT || 8000}`);

        })
    })
    .catch((error) => {
        console.log("MONGO DB connection failed", error);
    }
    )
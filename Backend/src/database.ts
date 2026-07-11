import mongoose from "mongoose";
import { 
  Comic, Chapter, Pages, User, Genre, Upload, AdminLogin, 
  Rating, ComicView, Comment, Favorite, Application, 
  ReadingProgress, Payment, ChapterUnlock, Report, AuditLog
} from "./models";

const uriFromEnv = process.env.MONGO_URI;
if (!uriFromEnv) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("MONGO_URI is required in production.");
  }
  console.error("WARNING: MONGO_URI was not found in the environment. Falling back to localhost.");
}

const dbURI = uriFromEnv || "mongodb://localhost:27017/skycomic";

// Use global to store connection in development to prevent multiple connections during hot reloads
const globalMongoose = (global as any).__webTruyenMongoose || ((global as any).__webTruyenMongoose = {
  promise: null,
  loggedUri: null,
});

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!globalMongoose.promise) {
    globalMongoose.promise = mongoose.connect(dbURI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 1,
      retryWrites: true,
    });
  }

  try {
    await globalMongoose.promise;
    const isAtlas = /\.mongodb\.net($|[:\/])/.test(dbURI);
    if (globalMongoose.loggedUri !== dbURI) {
      console.log(`Connected to MongoDB: ${isAtlas ? "MongoDB Atlas" : "Localhost"}`);
      globalMongoose.loggedUri = dbURI;
    }
    return mongoose.connection;
  } catch (err) {
    globalMongoose.promise = null;
    console.error("MongoDB connection error:", err);
    throw err;
  }
}

mongoose.connection.on("disconnected", () => {
  globalMongoose.promise = null;
});

export { 
  Comic,
  Chapter,
  Pages,
  Upload,
  AdminLogin,
  Genre,
  User,
  Rating,
  ComicView,
  Comment,
  Favorite,
  Application,
  ReadingProgress,
  Payment,
  ChapterUnlock,
  Report,
  AuditLog,
  connectDB,
  mongoose,
};

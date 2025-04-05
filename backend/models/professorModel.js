import mongoose from "mongoose"; // Import the Mongoose library to connect and interact with MongoDB

// Define the schema for the 'professor' collection in the database

const professorSchema = new mongoose.Schema({
    name: { type: String, required: true },     // The name of the professor (required field)
    email: { type: String, required: true, unique: true },    // The email of the professor (required field, must be unique)
    password: { type: String, required: true },    // The password of the professor (required field)
    image: { type: String, required: true },    // The image URL of the professor (required field, could be a profile picture)
    department: { type: String, required: true },    // The department to which the professor belongs (required field)
    about: { type: String, required: true },    // A short description or biography of the professor (required field)
    available: { type: Boolean, default: true },    // Whether the professor is currently available for appointments (defaults to true)
    slots_booked: { type: Object, default: {} },    // An object storing the booked slots for the professor, keyed by date (defaults to an empty object)
    date: { type: Number, required: true },    // The timestamp when the professor's account was created (required field)

}, { minimize: false }) // The 'minimize: false' option keeps empty objects (like slots_booked) in the database as empty objects, instead of removing them.

// Create a model for the 'professor' schema. If the model already exists, use the existing one.
// This model will be used to interact with the 'professors' collection in MongoDB.
const professorModel = mongoose.models.professor || mongoose.model("professor", professorSchema);

// Export the 'professorModel' so it can be used in other parts of the application
export default professorModel;
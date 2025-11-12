import { Schema, model } from "mongoose";
import auth from "../middleware/auth";


const recipeSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    image: {
        type: String,
        default: ""
    },
    prepTime: {
        type: Number,
        default: 0
    },
    cookTime: {
        type: Number,
        default: 0
    },
    servings: {
        type: Number,
        default: 1
    },
    difficultly: {
        type: String,
        enum: ["easy", "medium", "hard"],
        default: "easy"
    },
    ingredients: {
        type: [String],
        default: []
    },
    steps: {
        type: [String], default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Recipe = model("Recipe", recipeSchema);
export default Recipe;
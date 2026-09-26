import express from "express";
import { random } from "./utils";
import jwt from "jsonwebtoken";
import { ContentModel, LinkModel, UserModel } from "./db";
import { JWT_SECRET } from "./config";
import { userMiddleware } from "./middleware";
import cors from "cors";
import mongoose from "mongoose";

const app = express();
app.use(express.json()); // Middleware to parse JSON request bodies.
app.use(cors()); // Middleware to allow cross-origin requests.

// Route 1: User Signup
app.post("/api/v1/signup", async (req, res) => {
    const username = req.body.username?.trim();
    const password = req.body.password?.trim();

    // Reject if username or password is missing
    if (!username || !password) {
        res.status(400).json({ message: "Username and password are required" });
        return;
    }

    try {
        await UserModel.create({ username, password });
        res.json({ message: "User signed up" });
    } catch (e: any) {
        console.error("Signup error - code:", e.code, "message:", e.message);
        if (e.code === 11000) {
            res.status(409).json({ message: "User already exists" });
        } else {
            res.status(500).json({ message: "Internal server error", error: e.message });
        }
    }
});

// Route 2: User Signin
app.post("/api/v1/signin", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Find a user with the provided credentials.
    const existingUser = await UserModel.findOne({ username, password });
    if (existingUser) {
        // Generate a JWT token with the user's ID.
        const token = jwt.sign({ id: existingUser._id }, JWT_SECRET);
        res.json({ token, username: existingUser.username }); // Return token + username
    } else {
        // Send error response for invalid credentials.
        res.status(403).json({ message: "Incorrect credentials" });
    }
});


// Route 3: Add Content
app.post("/api/v1/content", userMiddleware, async (req, res) => {
    const { link, text, type, title } = req.body;
    // Create a new content entry linked to the logged-in user.
    const content = await ContentModel.create({
        link,
        text,
        type,
        title,
        userId: req.userId, // userId is added by the middleware.
        tags: [] // Initialize tags as an empty array.
    });

    res.status(201).json(content); // Return the saved document, including its id.
});

// Route 4: Get User Content
app.get("/api/v1/content", userMiddleware, async (req, res) => {
    const userId = req.userId;  // User ID is fetched from middleware
    // Fetch all content associated with the user ID and populate username
    // The `populate` function is used to include additional details from the referenced `userId`.
    // For example, it will fetch the username linked to the userId.
    // Since we specified "username", only the username will be included in the result, 
    // and other details like password won’t be fetched.
    const content = await ContentModel.find({ userId: userId }).populate("userId", "username");
    res.json(content);  // Send the content as response
});

// Route 5: Delete User Content
app.delete("/api/v1/content", userMiddleware, async (req, res) => {
    const contentId = req.body.contentId;

    if (typeof contentId !== "string" || !mongoose.Types.ObjectId.isValid(contentId)) {
        res.status(400).json({ message: "A valid content id is required" });
        return;
    }

    // Delete content based on _id and userId (ensure user owns the content).
    const deletedContent = await ContentModel.findOneAndDelete({ _id: contentId, userId: req.userId });
    if (!deletedContent) {
        res.status(404).json({ message: "Content not found" });
        return;
    }

    res.json({ message: "Deleted" });
});

// Route 6: Share Content Link
app.post("/api/v1/brain/share", userMiddleware, async (req, res) => {
    const { share } = req.body;
    if (share) {
        // Check if a link already exists for the user.
        const existingLink = await LinkModel.findOne({ userId: req.userId });
        if (existingLink) {
            res.json({ hash: existingLink.hash }); // Send existing hash if found.
            return;
        }

        // Generate a new hash for the shareable link.
        const hash = random(10);
        await LinkModel.create({ userId: req.userId, hash });
        res.json({ hash }); // Send new hash in the response.
    } else {
        // Remove the shareable link if share is false.
        await LinkModel.deleteOne({ userId: req.userId });
        res.json({ message: "Removed link" }); // Send success response.
    }
});

// Route 7: Get Shared Content
app.get("/api/v1/brain/:shareLink", async (req, res) => {
    const hash = req.params.shareLink;

    // Find the link using the provided hash.
    const link = await LinkModel.findOne({ hash });
    if (!link) {
        res.status(404).json({ message: "Invalid share link" }); // Send error if not found.
        return;
    }

    // Fetch content and user details for the shareable link.
    const content = await ContentModel.find({ userId: link.userId });
    const user = await UserModel.findOne({ _id: link.userId });

    if (!user) {
        res.status(404).json({ message: "User not found" }); // Handle missing user case.
        return;
    }

    res.json({
        username: user.username,
        content
    }); // Send user and content details in response.
});

// Start the server
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});


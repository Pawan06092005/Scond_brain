import express from "express";
import { random } from "./utils";
import jwt from "jsonwebtoken";
import { ContentModel, LinkModel, UserModel } from "./db";
import { JWT_SECRET } from "./config";
import { userMiddleware } from "./middleware";
import cors from "cors";
import mongoose from "mongoose";

// Simple "something@something.something" check for email addresses.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Fields that are safe to show to visitors of a share link.
const PUBLIC_CONTENT_FIELDS = "title link text description type";

const app = express();
app.use(express.json()); // Middleware to parse JSON request bodies.
app.use(cors()); // Middleware to allow cross-origin requests.

// Route 1: User Signup
app.post("/api/v1/signup", async (req, res) => {
    const username = req.body.username?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password?.trim();

    // Reject if any field is missing
    if (!username || !email || !password) {
        res.status(400).json({ message: "Username, email and password are required" });
        return;
    }
    if (!EMAIL_PATTERN.test(email)) {
        res.status(400).json({ message: "Please enter a valid email address" });
        return;
    }

    try {
        await UserModel.create({ username, email, password });
        res.json({ message: "User signed up" });
    } catch (e: any) {
        console.error("Signup error - code:", e.code, "message:", e.message);
        if (e.code === 11000) {
            // Tell the user which field is already taken
            const field = e.keyPattern?.email ? "email" : "username";
            res.status(409).json({ message: field === "email" ? "An account with this email already exists" : "This username is already taken" });
        } else {
            res.status(500).json({ message: "Internal server error", error: e.message });
        }
    }
});

// Route 2: User Signin
app.post("/api/v1/signin", async (req, res) => {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password?.trim();

    if (!email || !password) {
        res.status(400).json({ message: "Email and password are required" });
        return;
    }

    // Find a user with the provided credentials.
    const existingUser = await UserModel.findOne({ email, password });
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
    const { link, text, description, type, title } = req.body;
    // Create a new content entry linked to the logged-in user.
    const content = await ContentModel.create({
        link,
        text,
        description,
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
        const hash = random(16);
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
    // Only public fields are returned - no user ids or per-item share hashes.
    const content = await ContentModel.find({ userId: link.userId }).select(PUBLIC_CONTENT_FIELDS);
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

// Route 8: Share / unshare a single content item
app.post("/api/v1/content/:id/share", userMiddleware, async (req, res) => {
    const contentId = String(req.params.id);
    const { share } = req.body;

    if (!mongoose.Types.ObjectId.isValid(contentId)) {
        res.status(400).json({ message: "A valid content id is required" });
        return;
    }

    // Only the owner can share their content.
    const content = await ContentModel.findOne({ _id: contentId, userId: req.userId });
    if (!content) {
        res.status(404).json({ message: "Content not found" });
        return;
    }

    if (share) {
        // Reuse the existing link if this item is already shared.
        if (!content.shareHash) {
            content.shareHash = random(16);
            await content.save();
        }
        res.json({ hash: content.shareHash });
    } else {
        // Remove the hash so the old link stops working.
        await ContentModel.updateOne({ _id: contentId }, { $unset: { shareHash: 1 } });
        res.json({ message: "Removed link" });
    }
});

// Route 9: Get a single shared content item (public, no login)
app.get("/api/v1/shared/item/:hash", async (req, res) => {
    const content = await ContentModel.findOne({ shareHash: String(req.params.hash) })
        .select(`${PUBLIC_CONTENT_FIELDS} userId`)
        .populate<{ userId: { username: string } | null }>("userId", "username");

    if (!content) {
        res.status(404).json({ message: "Invalid share link" });
        return;
    }

    const { title, link, text, description, type } = content;
    res.json({
        username: content.userId?.username || "Someone",
        item: { _id: content._id, title, link, text, description, type }
    });
});

// Start the server
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});


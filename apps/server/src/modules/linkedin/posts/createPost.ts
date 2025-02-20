import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const LINKEDIN_ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN;
const LINKEDIN_USER_ID = process.env.LINKEDIN_USER_ID;

/**
 * API Endpoint for Letta to Create a LinkedIn Post
 */
app.post("/linkedin/post", async (req, res) => {
    try {
        const { text } = req.body; // Letta will send this data

        if (!text) {
            return res.status(400).json({ error: "Post text is required" });
        }

        const payload = {
            author: LINKEDIN_USER_ID,
            lifecycleState: "PUBLISHED",
            specificContent: {
                "com.linkedin.ugc.ShareContent": {
                    shareCommentary: {
                        text: text
                    },
                    shareMediaCategory: "NONE"
                }
            },
            visibility: {
                "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
            }
        };

        const response = await axios.post("https://api.linkedin.com/v2/ugcPosts", payload, {
            headers: {
                Authorization: `Bearer ${LINKEDIN_ACCESS_TOKEN}`,
                "X-Restli-Protocol-Version": "2.0.0",
                "Content-Type": "application/json"
            }
        });

        res.json({ success: true, postId: response.data.id });
    } catch (error) {
        res.status(500).json({ error: error.response?.data || error.message });
    }
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => console.log(`✅ API running on http://localhost:${PORT}`));

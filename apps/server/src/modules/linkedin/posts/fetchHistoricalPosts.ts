// TODO: Fetch last 100 posts from connected Linkedin Account
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const LINKEDIN_ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN;
const LINKEDIN_USER_ID = process.env.LINKEDIN_USER_ID;

/**
 * Fetches the last 100 historical posts from a LinkedIn user profile
 */
export const fetchLinkedInPosts = async () => {
    try {
        let posts: any[] = [];
        let start = 0;
        const count = 50; // LinkedIn allows a max of 50 per request

        while (posts.length < 100) {
            const response = await axios.get(`https://api.linkedin.com/v2/ugcPosts`, {
                headers: {
                    Authorization: `Bearer ${LINKEDIN_ACCESS_TOKEN}`,
                    "X-Restli-Protocol-Version": "2.0.0"
                },
                params: {
                    q: "author",
                    author: `urn:li:person:${LINKEDIN_USER_ID}`,
                    count,
                    start
                }
            });

            posts = posts.concat(response.data.elements);
            if (response.data.elements.length < count) break; // No more posts available
            start += count;
        }

        console.log(`Fetched ${posts.length} posts.`);
        return posts;
    } catch (error) {
        console.error("Error fetching posts:", error.response?.data || error.message);
    }
};

// Run the function
fetchLinkedInPosts();

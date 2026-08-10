import ai from '../config/gemini.js'
import ApiUsage from '../models/ApiUsage.js';

const streamResponse = async (messages) => {
    try {
        const contents = messages.map((msg) => (
            {
                role: msg.role === "assistant" ? "model" : "user",
                parts: [
                    {
                        text: msg.content
                    }
                ]
            }
        ))
        console.log(JSON.stringify(contents, null, 2));

        const response = await ai.models.generateContentStream({
            model: "gemini-3.5-flash-lite",
            contents: contents
        })

        //Today's date
        const today = new Date().toISOString().split("T")[0]

        //Find today's record
        let usage = await ApiUsage.findOne({ date: today })

        // If today doesn't exist, create it
        if (!usage) {
            usage = await ApiUsage.create({
                date: today,
                requestsUsed: 1,
            });
        } else {
            // Increase today's count
            usage.requestsUsed += 1;
            await usage.save();
        }

        console.log("Today's Requests :", usage.requestsUsed);
        console.log("Today's Date:", today);
        console.log("Usage Found:", usage);
        console.log("Created:", usage);

        return response

    }
    catch (error) {
        if (error.status === 429) {
            throw new Error(
                "JazzFlow AI is temporarily busy. Please try again later."
            );
        }

        throw error;
    }



}

export default streamResponse;

//gemini-flash-latest
//gemini-3.6-flash
//gemini-3.1-flash-lite
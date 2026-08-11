import streamResponse from "../services/geminiService.js";
import Chat from "../models/Chat.js";


// =====================================================
// JAZZFLOW IDENTITY RESPONSES
// =====================================================

const getJazzFlowResponse = (message) => {

    const text = message
        .toLowerCase()
        .trim()
        .replace(/[?!.,]/g, "")
        .replace(/\s+/g, " ");


    // =================================================
    // NAME
    // =================================================

    const nameQuestions = [
        "what is your name",
        "what's your name",
        "whats your name",
        "what your name",
        "your name",
        "tell me your name",
        "may i know your name",
        "who are you",
        "who r you",
        "who r u"
    ];


    if (nameQuestions.includes(text)) {

        return (
            "My name is JazzFlow AI. " +
            "I am the AI assistant created by MdFaisal."
        );
    }


    // =================================================
    // CREATOR
    // =================================================

    const creatorQuestions = [
        "who created you",
        "who is your creator",
        "who made you",
        "who built you",
        "who developed you",
        "who is your developer",
        "who created jazzflow",
        "who made jazzflow",
        "who built jazzflow",
        "who developed jazzflow"
    ];


    if (creatorQuestions.includes(text)) {

        return (
            "I was created by MdFaisal. " +
            "I am JazzFlow AI."
        );
    }


    // =================================================
    // WHY JAZZFLOW?
    // =================================================

    const nameStoryQuestions = [
        "why are you called jazzflow",
        "why is your name jazzflow",
        "why your name is jazzflow",
        "why are you named jazzflow",
        "why jazzflow",
        "what does jazzflow mean",
        "how did you get your name",
        "where did the name jazzflow come from",
        "why is it called jazzflow"
    ];


    if (nameStoryQuestions.includes(text)) {

        return (
            'My name is JazzFlow AI. The name "JazzFlow" comes ' +
            "from my creator MdFaisal's future wife, Jazz. " +
            "She is a very talkative person who can talk anytime, " +
            "anywhere, and about any topic. " +
            'The "Jazz" in JazzFlow is a reference to her name, ' +
            'while "Flow" represents a continuous flow of conversation, ' +
            "ideas, and interaction."
        );
    }


    // =================================================
    // ABOUT JAZZFLOW
    // =================================================

    const aboutQuestions = [
        "what is jazzflow",
        "what is jazzflow ai",
        "tell me about jazzflow",
        "about jazzflow",
        "describe jazzflow"
    ];


    if (aboutQuestions.includes(text)) {

        return (
            "JazzFlow AI is an AI assistant created by MdFaisal. " +
            "It is designed to provide helpful conversations, " +
            "ideas, analysis, coding assistance, and other AI-powered help."
        );
    }


    // =================================================
    // NOT AN IDENTITY QUESTION
    // =================================================

    return null;
};


// =====================================================
// CHAT WITH AI
// =====================================================

const chatWithAi = async (req, res) => {

    try {

        const { message } = req.body;


        // =================================================
        // VALIDATE MESSAGE
        // =================================================

        if (!message || !message.trim()) {

            return res.status(400).json({
                success: false,
                message: "Message is required"
            });

        }


        console.log(
            "🔥 LOCAL CHAT MESSAGE:",
            message
        );


        // =================================================
        // FIND CHAT
        // =================================================

        const chat = await Chat.findById(
            req.params.id
        );


        if (!chat) {

            return res.status(404).json({
                success: false,
                message: "Chat not found"
            });

        }


        // =================================================
        // SAVE USER MESSAGE
        // =================================================

        chat.messages.push({
            role: "user",
            content: message.trim()
        });


        await chat.save();


        // =================================================
        // CHECK JAZZFLOW IDENTITY
        // =================================================

        const jazzFlowResponse =
            getJazzFlowResponse(message);


        // =================================================
        // IMPORTANT
        //
        // If this is a JazzFlow identity question,
        // DO NOT CALL GEMINI.
        // =================================================

        if (jazzFlowResponse) {

            console.log(
                "✅ JazzFlow identity response used"
            );


            // Save assistant response
            chat.messages.push({
                role: "assistant",
                content: jazzFlowResponse
            });


            await chat.save();


            // Response headers
            res.setHeader(
                "Content-Type",
                "text/plain; charset=utf-8"
            );

            res.setHeader(
                "Cache-Control",
                "no-cache"
            );


            res.flushHeaders();


            // Send JazzFlow response
            res.write(jazzFlowResponse);


            res.end();


            // VERY IMPORTANT
            // Stop here.
            // Gemini will NOT receive the question.
            return;
        }


        // =================================================
        // NORMAL GEMINI RESPONSE
        // =================================================

        console.log(
            "🤖 Sending normal question to Gemini"
        );


        res.setHeader(
            "Content-Type",
            "text/plain; charset=utf-8"
        );


        res.setHeader(
            "Cache-Control",
            "no-cache"
        );


        res.flushHeaders();


        // =================================================
        // CALL GEMINI
        // =================================================

        const stream = await streamResponse(
            chat.messages
        );


        let fullReply = "";


        // =================================================
        // STREAM GEMINI RESPONSE
        // =================================================

        for await (const chunk of stream) {

            const text = chunk.text;


            if (!text) {
                continue;
            }


            fullReply += text;


            res.write(text);
        }


        // =================================================
        // SAVE AI RESPONSE
        // =================================================

        chat.messages.push({
            role: "assistant",
            content: fullReply
        });


        await chat.save();


        // =================================================
        // END RESPONSE
        // =================================================

        res.end();

    }

    catch (error) {

        console.error(
            "❌ Streaming Chat Error:",
            error
        );


        // If headers have NOT been sent
        if (!res.headersSent) {

            return res.status(500).json({
                success: false,
                message:
                    error.message ||
                    "Something went wrong"
            });

        }


        // If streaming already started
        res.end();
    }
};


// =====================================================
// GET ALL CHATS
// =====================================================

export const getChats = async (req, res) => {

    try {

        const chats = await Chat
            .find()
            .sort({
                updatedAt: -1
            });


        res.json(chats);

    }
    catch (error) {

        console.error(
            "Get chats error:",
            error
        );


        res.status(500).json({
            success: false,
            message: "Failed to load chats"
        });

    }
};


// =====================================================
// GET SINGLE CHAT
// =====================================================

export const getChat = async (req, res) => {

    try {

        const chat = await Chat.findById(
            req.params.id
        );


        if (!chat) {

            return res.status(404).json({
                success: false,
                message: "Chat not found"
            });

        }


        res.json(chat);

    }
    catch (error) {

        console.error(
            "Get chat error:",
            error
        );


        res.status(500).json({
            success: false,
            message: "Failed to load chat"
        });

    }
};


// =====================================================
// DELETE CHAT
// =====================================================

export const deleteChat = async (req, res) => {

    try {

        await Chat.findByIdAndDelete(
            req.params.id
        );


        res.json({
            success: true
        });

    }
    catch (error) {

        console.error(
            "Delete chat error:",
            error
        );


        res.status(500).json({
            success: false,
            message: "Failed to delete chat"
        });

    }
};


// =====================================================
// EXPORT
// =====================================================

export default chatWithAi;


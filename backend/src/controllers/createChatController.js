import Chat from "../models/Chat.js";

export const createChat = async (req, res) => {
    try {

        const { title } = req.body;

        const chat = await Chat.create({
            title: title?.trim() || "New Chat",
            messages: []
        });

        res.status(201).json({
            success: true,
            chat
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};
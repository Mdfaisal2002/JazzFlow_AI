import streamResponse from '../services/geminiService.js'
import Chat from '../models/Chat.js'

const chatWithAi = async (req, res) => {
    try {
        const { message } = req.body

        const chat = await Chat.findById(req.params.id)

        console.log(chat)

        if (!chat) {
            return res.status(400).json({
                success: false,
                message: "Chat not found"
            })
        }

        chat.messages.push({
            role: "user",
            content: message,
        })

        await chat.save()

        res.setHeader(
            "Content-Type",
            "Text/plain; charset=utf-8"
        )

        res.setHeader("Cache-Control", "no-cache");

        res.flushHeaders();

        const stream = await streamResponse(chat.messages)

        let fullReplay = ""

        for await (const chunk of stream) {
            const text = chunk.text

            if (!text) continue

            fullReplay += text

            res.write(text)
        }

        chat.messages.push({
            role: "assistant",
            content: fullReplay,
        })

        await chat.save()

        res.end()

    
    }
    catch (error) {

        console.error(
            "Streaming Chat Error:",
            error
        );


        // ==============================================
        // IMPORTANT
        // ==============================================

        // If response has NOT started
        // we can safely send JSON error

        if (!res.headersSent) {

            return res.status(500).json({
                success: false,
                message: error.message,
            });

        }


        // If response already started,
        // DON'T use res.json()

        res.end();
    }
}

export const getChats = async (req, res) => {
    const chats = await Chat.find().sort({
        updatedAt: -1
    })

    res.json(chats);
}

export const getChat = async (req, res) => {
    const chat = await Chat.findById(req.params.id)

    res.json(chat)
}

export const deleteChat = async (req, res) => {
    await Chat.findByIdAndDelete(req.params.id)

    res.json({
        success: true
    })
}



export default chatWithAi;
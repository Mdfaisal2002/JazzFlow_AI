import ApiUsage from "../models/ApiUsage.js";

export const getUsage = async (req, res) => {

    try {

        const today = new Date().toISOString().split("T")[0];

        const usage = await ApiUsage.findOne({ date: today });

        const requestsUsed = usage ? usage.requestsUsed : 0;

        res.status(200).json({
            success: true,
            requestsUsed,
            remaining: 500 - requestsUsed
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};
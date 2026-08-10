import mongoose from 'mongoose'

const apiUsageSchema = new mongoose.Schema({
    date: {
        type: String,
        required: true,
        unique: true,
    },
    
    requestsUsed: {
        type: Number,
        default: 0,
    },
},
{
    timestamps: true,
}

);

export default mongoose.model("ApiUsage",apiUsageSchema)
import api from '../api/api.js'

 const sentMessage = async(message) => {
    const responce =await api.post("/ai/chat", {
        message
    })
    return responce.data.reply
}

export default sentMessage;
    import api from "../api/api";

    export const getUsage = async () => {

        const response = await api.get("/usage");

        return response.data;

    };
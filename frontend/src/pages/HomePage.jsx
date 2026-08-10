import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Main from "../components/Main";

const HomePage = () => {

    const [selectedChatId, setSelectedChatId] = useState(null);
    const [historyRefresh, setHistoryRefresh] = useState(0);

    const handleNewChat = () => {
        setSelectedChatId(null);
    };

    const handleChatCreated = () => {
        setHistoryRefresh((prev) => prev + 1);
    };

    return (
        <div className="flex h-screen">

            <Sidebar
                onNewChat={handleNewChat}
                onSelectChat={setSelectedChatId}
                historyRefresh={historyRefresh}
            />

            <div className="flex-1 overflow-auto">
                <Main
                    chatId={selectedChatId}
                    onChatCreated={handleChatCreated}
                />
            </div>

        </div>
    );
};

export default HomePage;
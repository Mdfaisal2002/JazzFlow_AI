import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Main from "../components/Main";

const HomePage = () => {

    const [selectedChatId, setSelectedChatId] = useState(null);

    const [historyRefresh, setHistoryRefresh] = useState(0);

    // NEW: forces Main to reset for every new chat
    const [newChatKey, setNewChatKey] = useState(0);

    const handleNewChat = () => {
        setSelectedChatId(null);

        // Force Main component to completely reset
        setNewChatKey((prev) => prev + 1);
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
                    key={`${selectedChatId || "new"}-${newChatKey}`}
                    chatId={selectedChatId}
                    onChatCreated={handleChatCreated}
                />

            </div>

        </div>
    );
};

export default HomePage;
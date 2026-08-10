import {
  History,
  Search,
  SquarePen,
  Settings,
  Menu,
  Trash2,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api.js";

const Sidebar = ({
  onNewChat,
  onSelectChat,
  historyRefresh,
}) => {

  const [extended, setExtended] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [searchText, setSearchText] = useState("");

  const navigate = useNavigate();

  // Load History
  const loadHistory = async () => {
    try {
      const response = await api.get("/ai/history");

      setHistory(response.data);
    } catch (error) {
      console.error(
        "History error:",
        error.response?.data || error.message
      );
    }
  };

  // Load history when sidebar opens
  useEffect(() => {
    loadHistory();
  }, [historyRefresh]);

  // New Chat
  const handleNewChat = () => {
    onNewChat();

    setShowHistory(false);
    setSearchText("");

    navigate("/");
  };

  // Select Chat
  const handleSelectChat = (id) => {
    onSelectChat(id);

    setShowHistory(true);
  };


  //Delete Chat
  const handleDeleteChat = async (id) => {
    try {
      await api.delete(`/ai/chat/${id}`);

      setHistory((prev) =>
        prev.filter((chat) => chat._id !== id)
      );

    } catch (error) {
      console.error(
        "Delete chat error:",
        error.response?.data || error.message
      );
    }
  };

  const filteredHistory = history.filter((chat) =>
    (chat.title || "New Chat")
      .toLowerCase()
      .includes(searchText.toLowerCase())
  );

  return (
    <aside
      className={`
        ${extended ? "w-64" : "w-20"
        }
        flex
        flex-col
        bg-slate-900
        text-white
        h-screen
        transition-all
        duration-300
        shrink-0
      `}
    >

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">

        <button
          onClick={() => setExtended((prev) => !prev)}
          className="p-2 rounded-lg hover:bg-slate-800 transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        {extended && (
          <h1 className="text-xl font-semibold">
            JazzFlow AI
          </h1>
        )}

      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 space-y-2 overflow-hidden">

        {/* New Chat */}
        <button
          onClick={handleNewChat}
          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition"
        >
          <SquarePen className="w-5 h-5 shrink-0" />

          {extended && (
            <span>
              New Chat
            </span>
          )}
        </button>


        {/* Search */}
        <button
          onClick={() => {
            setExtended(true);
            setShowHistory(true);
          }}
          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition"
        >
          <Search className="w-5 h-5 shrink-0" />

          {extended && (
            <span>
              Search
            </span>
          )}
        </button>

        {extended && showHistory && (
          <div className="px-1 pt-2">

            <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2">

              <Search className="w-4 h-4 text-slate-400 shrink-0" />

              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search conversations..."
                className="
                w-full
                bg-transparent
                outline-none
                text-sm
                text-white
                placeholder:text-slate-500
              "
              />

            </div>

          </div>
        )}


        {/* History */}
        <button
          onClick={() => {
            setShowHistory((prev) => !prev);

            if (!showHistory) {
              loadHistory();
            }
          }}
          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition"
        >
          <History className="w-5 h-5 shrink-0" />

          {extended && (
            <span>
              History
            </span>
          )}
        </button>

        {/* History List */}
        {/* History List */}
        {extended && showHistory && (
          <div className="mt-2 space-y-1 max-h-[calc(100vh-250px)] overflow-y-auto">

            {filteredHistory.length === 0 ? (

              <p className="text-sm text-slate-500 px-3 py-2">
                No conversations found
              </p>

            ) : (

              filteredHistory.map((chat) => (

                <div
                  key={chat._id}
                  className="
                        group
                        flex
                        items-center
                        gap-2
                        w-full
                        rounded-lg
                        hover:bg-slate-800
                        transition
                    "
                >

                  {/* Chat Title */}
                  <button
                    onClick={() => handleSelectChat(chat._id)}
                    className="
                            flex-1
                            text-left
                            px-3
                            py-2
                            text-sm
                            text-slate-300
                            truncate
                        "
                  >
                    {chat.title || "New Chat"}
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDeleteChat(chat._id)}
                    className="
                            p-2
                            mr-1
                            text-slate-500
                            hover:text-red-400
                            opacity-0
                            group-hover:opacity-100
                            transition
                        "
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                </div>

              ))

            )}

          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700">

        <button
          onClick={() => navigate("/settings")}
          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition"
        >

          <Settings className="w-5 h-5 shrink-0" />

          {extended && (
            <span>
              Settings
            </span>
          )}

        </button>

      </div>

    </aside>
  );
};

export default Sidebar;
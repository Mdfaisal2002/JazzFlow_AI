import {
  History,
  Search,
  SquarePen,
  Settings,
  Menu,
  Trash2,
  X,
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
  const [mobileOpen, setMobileOpen] = useState(false);

  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [searchText, setSearchText] = useState("");

  const navigate = useNavigate();

  // =========================
  // Load History
  // =========================

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

  // Load history
  useEffect(() => {
    loadHistory();
  }, [historyRefresh]);

  // =========================
  // New Chat
  // =========================

  const handleNewChat = () => {
    // Tell HomePage to create a fresh chat
    onNewChat();

    // Reset sidebar state
    setShowHistory(false);
    setSearchText("");

    // Close mobile sidebar
    setMobileOpen(false);

    // Go home
    navigate("/");
  };

  // =========================
  // Select Chat
  // =========================

  const handleSelectChat = (id) => {
    onSelectChat(id);

    setShowHistory(true);

    // Close mobile sidebar
    setMobileOpen(false);
  };

  // =========================
  // Delete Chat
  // =========================

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

  // =========================
  // Search
  // =========================

  const filteredHistory = history.filter((chat) =>
    (chat.title || "New Chat")
      .toLowerCase()
      .includes(searchText.toLowerCase())
  );

  return (
    <>
      {/* =========================================
          MOBILE MENU BUTTON
          Only visible on phone
      ========================================= */}

      <button
        onClick={() => setMobileOpen(true)}
        className="
          fixed
          top-4
          left-4
          z-50
          md:hidden
          p-2.5
          rounded-xl
          bg-slate-900
          text-white
          border
          border-slate-700
          shadow-lg
          hover:bg-slate-800
          transition
        "
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>


      {/* =========================================
          MOBILE BACKDROP
      ========================================= */}

      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="
            fixed
            inset-0
            z-40
            bg-black/60
            md:hidden
          "
        />
      )}


      {/* =========================================
          SIDEBAR
      ========================================= */}

      <aside
        className={`
          fixed
          md:relative

          top-0
          left-0

          z-50

          h-screen

          flex
          flex-col

          bg-slate-900
          text-white

          border-r
          border-slate-800

          transition-all
          duration-300
          ease-in-out

          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }

          md:translate-x-0

          ${
            extended
              ? "md:w-64"
              : "md:w-20"
          }

          w-72

          shrink-0
        `}
      >

        {/* =====================================
            HEADER
        ===================================== */}

        <div
          className="
            flex
            items-center
            justify-between
            p-4
            border-b
            border-slate-800
          "
        >

          <div className="flex items-center gap-3">

            {/* Desktop Toggle */}
            <button
              onClick={() =>
                setExtended((prev) => !prev)
              }
              className="
                hidden
                md:flex
                p-2
                rounded-lg
                hover:bg-slate-800
                transition
              "
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile Close */}
            <button
              onClick={() => setMobileOpen(false)}
              className="
                flex
                md:hidden
                p-2
                rounded-lg
                hover:bg-slate-800
                transition
              "
            >
              <X className="w-5 h-5" />
            </button>

            {/* Logo */}
            <h1
              className={`
                text-lg
                font-semibold
                whitespace-nowrap

                ${
                  extended
                    ? "md:block"
                    : "md:hidden"
                }

                block
              `}
            >
              JazzFlow AI
            </h1>

          </div>

        </div>


        {/* =====================================
            NAVIGATION
        ===================================== */}

        <div className="flex-1 p-3 space-y-2 overflow-hidden">

          {/* ===================================
              NEW CHAT
          =================================== */}

          <button
            onClick={handleNewChat}
            className="
              w-full
              flex
              items-center
              gap-3
              p-3
              rounded-xl
              hover:bg-slate-800
              transition
            "
          >

            <SquarePen className="w-5 h-5 shrink-0" />

            <span
              className={`
                ${
                  extended
                    ? "md:block"
                    : "md:hidden"
                }

                block
              `}
            >
              New Chat
            </span>

          </button>

          


          {/* ===================================
              SEARCH
          =================================== */}

          <button
            onClick={() => {
              setExtended(true);
              setShowHistory(true);
            }}
            className="
              w-full
              flex
              items-center
              gap-3
              p-3
              rounded-xl
              hover:bg-slate-800
              transition
            "
          >

            <Search className="w-5 h-5 shrink-0" />

            <span
              className={`
                ${
                  extended
                    ? "md:block"
                    : "md:hidden"
                }

                block
              `}
            >
              Search
            </span>

          </button>


          {/* ===================================
              SEARCH INPUT
          =================================== */}

          {showHistory && (
            <div
              className={`
                px-1
                pt-1

                ${
                  extended
                    ? "md:block"
                    : "md:hidden"
                }

                block
              `}
            >

              <div
                className="
                  flex
                  items-center
                  gap-2
                  bg-slate-800
                  rounded-lg
                  px-3
                  py-2
                "
              >

                <Search
                  className="
                    w-4
                    h-4
                    text-slate-400
                    shrink-0
                  "
                />

                <input
                  type="text"
                  value={searchText}
                  onChange={(e) =>
                    setSearchText(e.target.value)
                  }
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


          {/* ===================================
              HISTORY BUTTON
          =================================== */}

          <button
            onClick={() => {
              const nextState = !showHistory;

              setShowHistory(nextState);

              if (nextState) {
                setExtended(true);
                loadHistory();
              }
            }}
            className="
              w-full
              flex
              items-center
              gap-3
              p-3
              rounded-xl
              hover:bg-slate-800
              transition
            "
          >

            <History className="w-5 h-5 shrink-0" />

            <span
              className={`
                ${
                  extended
                    ? "md:block"
                    : "md:hidden"
                }

                block
              `}
            >
              History
            </span>

          </button>


          {/* ===================================
              HISTORY LIST
          =================================== */}

          {showHistory && (
            <div
              className={`
                mt-2
                space-y-1
                max-h-[calc(100vh-250px)]
                overflow-y-auto

                ${
                  extended
                    ? "md:block"
                    : "md:hidden"
                }

                block
              `}
            >

              {filteredHistory.length === 0 ? (

                <p
                  className="
                    text-sm
                    text-slate-500
                    px-3
                    py-2
                  "
                >
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
                      gap-1
                      w-full
                      rounded-lg
                      hover:bg-slate-800
                      transition
                    "
                  >

                    {/* Chat */}
                    <button
                      onClick={() =>
                        handleSelectChat(chat._id)
                      }
                      className="
                        flex-1
                        min-w-0
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
                      onClick={() =>
                        handleDeleteChat(chat._id)
                      }
                      className="
                        p-2
                        mr-1
                        text-slate-500
                        hover:text-red-400
                        opacity-0
                        group-hover:opacity-100
                        transition
                      "
                      aria-label="Delete chat"
                    >

                      <Trash2 className="w-4 h-4" />

                    </button>

                  </div>

                ))

              )}

            </div>
          )}

        </div>


        {/* =====================================
            FOOTER
        ===================================== */}

        <div
          className="
            p-3
            border-t
            border-slate-800
          "
        >

          <button
            onClick={() => {
              navigate("/settings");
              setMobileOpen(false);
            }}
            className="
              w-full
              flex
              items-center
              gap-3
              p-3
              rounded-xl
              hover:bg-slate-800
              transition
            "
          >

            <Settings className="w-5 h-5 shrink-0" />

            <span
              className={`
                ${
                  extended
                    ? "md:block"
                    : "md:hidden"
                }

                block
              `}
            >
              Settings
            </span>

          </button>

        </div>

      </aside>
    </>
  );
};

export default Sidebar;

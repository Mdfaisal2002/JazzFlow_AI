import {
    FileSearch,
    Plus,
    SendHorizontal,
    ChartNoAxesCombined,
    Code2,
} from "lucide-react";

import { useRef, useState, useEffect } from "react";
import sendMessage from "../services/aiService.js";
import api from "../api/api.js";

const Main = ({
    chatId: selectedChatId,
    onChatCreated,
}) => {

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [chatId, setChatId] = useState(null);

    // =========================================
    // Mobile keyboard-safe viewport height
    // =========================================
    // iOS Safari / Android Chrome don't shrink the layout
    // viewport when the on-screen keyboard opens — they shrink
    // window.visualViewport instead. We track that value and use
    // it (when available) to size the outer container, so the
    // input area is always pushed above the keyboard instead of
    // being covered by it. Falls back to 100dvh/100svh via CSS
    // when the Visual Viewport API isn't supported.
    const [viewportHeight, setViewportHeight] = useState(null);

    const textareaRef = useRef(null);

    // =========================================
    // Conversation scroll container ref
    // =========================================
    // This ref points at the SAME element that holds
    // overflow-y-auto (the <main> below). We scroll *this*
    // element's scrollTop directly instead of using
    // scrollIntoView, so only the conversation pane moves —
    // never the page/body.
    const messagesContainerRef = useRef(null);

    useEffect(() => {

        const vv = window.visualViewport;

        if (!vv) return;

        const handleViewportResize = () => {
            setViewportHeight(vv.height);
        };

        handleViewportResize();

        vv.addEventListener("resize", handleViewportResize);
        vv.addEventListener("scroll", handleViewportResize);

        return () => {
            vv.removeEventListener("resize", handleViewportResize);
            vv.removeEventListener("scroll", handleViewportResize);
        };

    }, []);

    // =========================================
    // Auto-scroll conversation to bottom
    // =========================================
    // Runs whenever messages change (new message sent) or while
    // the AI response is streaming in. Scrolls only the messages
    // container (scrollTop), so the header/input/page never move.
    useEffect(() => {

        const container = messagesContainerRef.current;

        if (!container) return;

        container.scrollTop = container.scrollHeight;

    }, [messages, loading]);

    // =========================================
    // Generate Chat Title
    // =========================================

    const generateChatTitle = (text) => {
        const cleanText = text.trim();

        if (cleanText.length <= 40) {
            return cleanText;
        }

        return cleanText.substring(0, 40) + "...";
    };

    // =========================================
    // Create Chat
    // =========================================

    const createChat = async (firstMessage) => {
        try {

            const title = generateChatTitle(firstMessage);

            const response = await api.post("/ai/chat/", {
                title,
            });

            const newChatId = response.data.chat._id;

            setChatId(newChatId);

            return newChatId;

        } catch (error) {

            console.error(
                "Create chat error:",
                error.response?.data || error.message
            );

            return null;
        }
    };

    // =========================================
    // Handle Send
    // =========================================

    const handleSend = async () => {

        if (!message.trim() || loading) return;

        const userMessage = message.trim();

        // Clear input
        setMessage("");

        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }

        setLoading(true);

        try {

            // =========================================
            // 1. Get existing chat ID
            // =========================================

            let currentChatId = chatId;

            // =========================================
            // 2. Create chat only for first message
            // =========================================

            if (!currentChatId) {

                currentChatId = await createChat(userMessage);

                if (!currentChatId) {
                    setLoading(false);
                    return;
                }
            }

            // =========================================
            // 3. Add user message
            // =========================================

            setMessages((prev) => [
                ...prev,
                {
                    role: "user",
                    content: userMessage,
                },
            ]);

            // =========================================
            // 4. Add empty AI message
            // =========================================

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "",
                },
            ]);

            // =========================================
            // 5. Refresh sidebar history
            // =========================================

            if (!chatId) {
                onChatCreated?.();
            }

            // =========================================
            // 6. Send message to backend
            // =========================================

            const response = await api.post(
                `/ai/chat/${currentChatId}`,
                {
                    message: userMessage,
                },
                {
                    responseType: "stream",
                    adapter: "fetch",
                }
            );

            // =========================================
            // 7. Read Gemini stream
            // =========================================

            const reader = response.data.getReader();

            const decoder = new TextDecoder();

            while (true) {

                const { value, done } = await reader.read();

                if (done) break;

                const chunk = decoder.decode(value, {
                    stream: true,
                });

                if (!chunk) continue;

                // =====================================
                // 8. Update AI message progressively
                // =====================================

                setMessages((prev) => {

                    const updated = [...prev];

                    const lastIndex = updated.length - 1;

                    if (
                        updated[lastIndex] &&
                        updated[lastIndex].role === "assistant"
                    ) {

                        updated[lastIndex] = {
                            ...updated[lastIndex],
                            content:
                                updated[lastIndex].content + chunk,
                        };
                    }

                    return updated;
                });
            }

        } catch (error) {

            console.error(
                "Chat error:",
                error.response?.data || error.message
            );

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content:
                        "Sorry, something went wrong. Please try again.",
                },
            ]);

        } finally {

            setLoading(false);

        }
    };

    // =========================================
    // Handle Input Change
    // =========================================

    const handleInputChange = (e) => {

        setMessage(e.target.value);

        const textarea = textareaRef.current;

        if (!textarea) return;

        textarea.style.height = "auto";

        textarea.style.height = `${Math.min(
            textarea.scrollHeight,
            200
        )}px`;
    };

    // =========================================
    // Handle Textarea Focus
    // =========================================

    const handleTextareaFocus = () => {

        /*
         * On mobile, when the keyboard opens, the
         * visualViewport resize listener (above) already
         * shrinks the outer container so the input area sits
         * right above the keyboard. We just nudge the textarea
         * into view within its own scroll context as a safety
         * net for browsers where the resize event fires slightly
         * after focus.
         */

        setTimeout(() => {

            if (textareaRef.current) {

                textareaRef.current.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest",
                });
            }

        }, 100);
    };

    // =========================================
    // Load Existing Chat
    // =========================================

    useEffect(() => {

        if (selectedChatId) {
            loadChat(selectedChatId);
        }

    }, [selectedChatId]);

    // =========================================
    // New Chat
    // =========================================

    useEffect(() => {

        if (selectedChatId === null) {

            setChatId(null);
            setMessages([]);

            setMessage("");

            if (textareaRef.current) {
                textareaRef.current.style.height = "auto";
            }
        }

    }, [selectedChatId]);

    // =========================================
    // Load Chat
    // =========================================

    const loadChat = async (id) => {

        try {

            const response = await api.get(`/ai/chat/${id}`);

            const chat = response.data;

            setChatId(chat._id);

            setMessages(
                chat.messages.map((msg) => ({
                    role: msg.role,
                    content: msg.content,
                }))
            );

        } catch (error) {

            console.error(
                "Load chat error:",
                error.response?.data || error.message
            );
        }
    };


    return (
        <div
            className="
                    flex
                    flex-col
                    bg-[#0B0F19]
                    h-screen
                    w-full
                    overflow-hidden
                    sm:px-4
                    lg:px-6
                "
            style={{
                // Prefer the live visualViewport height (keyboard-aware)
                // when available; otherwise fall back to dynamic/small
                // viewport units. If the browser doesn't support the
                // dvh unit, the whole inline declaration is dropped and
                // the h-screen class above takes over instead.
                height: viewportHeight
                    ? `${viewportHeight}px`
                    : "100dvh",
                minHeight: viewportHeight ? undefined : "100svh",
            }}
        >

            {/* =========================
            MAIN CONTENT
        ========================= */}

            <div
                ref={messagesContainerRef}
                className="
                flex-1
                min-h-0
                overflow-y-auto
                overscroll-contain
            "
                style={{
                    WebkitOverflowScrolling: "touch",
                    touchAction: "pan-y",
                }}
            >

                {/* =========================
                HOME / EMPTY CHAT
            ========================= */}

                {messages.length === 0 && (
                    <div
                        className="
                        min-h-full
                        flex
                        flex-col
                        justify-center
                        items-center
                        px-4
                        py-10
                    "
                    >

                        <div className="text-center mb-10">

                            <h1
                                className="
                                text-2xl
                                sm:text-3xl
                                lg:text-4xl
                                mb-2
                                font-bold
                                text-[#D4E4FA]
                            "
                            >
                                How can{" "}
                                <span className="text-[#ADC6FF]">
                                    JazzFlow
                                </span>{" "}
                                help today?
                            </h1>

                            <p
                                className="
                                max-w-2xl
                                mx-auto
                                text-sm
                                sm:text-base
                                text-[#ccd2e2]
                            "
                            >
                                Your professional AI partner for analysis,
                                strategy, and deep insights.
                            </p>

                        </div>


                        {/* =========================
                        CARDS
                    ========================= */}

                        <div
                            className="
                            grid
                            grid-cols-1
                            sm:grid-cols-3
                            gap-4
                            w-full
                            max-w-6xl
                            pb-10
                        "
                        >

                            {/* Document */}

                            <div
                                className="
                                flex
                                gap-3
                                items-center
                                md:block
                                p-3
                                md:p-5
                                bg-[#1C2637]
                                rounded-xl
                                hover:-translate-y-1
                                transition
                                border-2
                                border-transparent
                                hover:border-[#b7cbf7]
                            "
                            >

                                <FileSearch
                                    className="
                                    w-10
                                    h-10
                                    shrink-0
                                    text-[#8A9FCE]
                                    bg-[#2B3649]
                                    rounded-xl
                                    p-2
                                "
                                />

                                <div>

                                    <h2
                                        className="
                                        text-[#C9D8ED]
                                        py-1
                                        text-lg
                                        font-bold
                                    "
                                    >
                                        Analyze a document
                                    </h2>

                                    <p
                                        className="
                                        hidden
                                        md:block
                                        text-[#9298A8]
                                    "
                                    >
                                        Upload PDFs for rapid summarization
                                        and deep data extraction.
                                    </p>

                                </div>

                            </div>


                            {/* Marketing */}

                            <div
                                className="
                                flex
                                gap-3
                                items-center
                                md:block
                                p-3
                                md:p-5
                                bg-[#1C2637]
                                rounded-xl
                                hover:-translate-y-1
                                transition
                                border-2
                                border-transparent
                                hover:border-[#b7cbf7]
                            "
                            >

                                <ChartNoAxesCombined
                                    className="
                                    w-10
                                    h-10
                                    shrink-0
                                    text-[#8A9FCE]
                                    bg-[#2B3649]
                                    rounded-xl
                                    p-2
                                "
                                />

                                <div>

                                    <h2
                                        className="
                                        text-[#C9D8ED]
                                        py-1
                                        text-lg
                                        font-bold
                                    "
                                    >
                                        Marketing strategy
                                    </h2>

                                    <p
                                        className="
                                        hidden
                                        md:block
                                        text-[#9298A8]
                                    "
                                    >
                                        Generate omni-channel campaigns
                                        based on target personas.
                                    </p>

                                </div>

                            </div>


                            {/* Code */}

                            <div
                                className="
                                flex
                                gap-3
                                items-center
                                md:block
                                p-3
                                md:p-5
                                bg-[#1C2637]
                                rounded-xl
                                hover:-translate-y-1
                                transition
                                border-2
                                border-transparent
                                hover:border-[#b7cbf7]
                            "
                            >

                                <Code2
                                    className="
                                    w-10
                                    h-10
                                    shrink-0
                                    text-[#8A9FCE]
                                    bg-[#2B3649]
                                    rounded-xl
                                    p-2
                                "
                                />

                                <div>

                                    <h2
                                        className="
                                        text-[#C9D8ED]
                                        py-1
                                        text-lg
                                        font-bold
                                    "
                                    >
                                        Review my code
                                    </h2>

                                    <p
                                        className="
                                        hidden
                                        md:block
                                        text-[#9298A8]
                                    "
                                    >
                                        Identify bugs, optimize performance,
                                        and refactor architecture.
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>
                )}


                {/* =========================
                MESSAGES
            ========================= */}

                {messages.length > 0 && (

                    <div
                        className="
                        w-full
                        max-w-5xl
                        mx-auto
                        px-3
                        sm:px-4
                        py-6
                        space-y-5
                    "
                    >

                        {messages.map((msg, index) => (

                            <div
                                key={index}
                                className={`
                                flex
                                w-full
                                min-w-0
                                ${msg.role === "user"
                                        ? "justify-end"
                                        : "justify-start"
                                    }
                            `}
                            >

                                <div
                                    className={` 
                                            max-w-[88%]
                                            sm:max-w-[80%]
                                            min-w-0
                                            rounded-2xl
                                            px-4
                                            sm:px-5
                                            py-3
                                            shadow-md
                                            whitespace-pre-wrap
                                            wrap-break-word
                                            ${msg.role === "user"
                                            ? "bg-[#329CEF] text-white"
                                            : "bg-[#1C2637] text-[#E6EDF7]"
                                        }
`}
                                    style={{
                                        overflowWrap: "anywhere",
                                        wordBreak: "break-word",
                                    }}
                                >

                                    <p
                                        className="
                                        text-xs
                                        mb-1
                                        opacity-70
                                    "
                                    >
                                        {msg.role === "user"
                                            ? "You"
                                            : "JazzFlow AI"}
                                    </p>

                                    <p className="text-sm sm:text-base">
                                        {msg.content}

                                        {loading &&
                                            msg.role === "assistant" &&
                                            index === messages.length - 1 && (
                                                <span className="animate-pulse ml-1">
                                                    ▌
                                                </span>
                                            )}
                                    </p>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </div>


            {/* =========================
            THINKING INDICATOR
        ========================= */}

            {loading && (
                <div
                    className="
                    shrink-0
                    px-4
                    pb-2
                    text-sm
                    text-slate-400
                    animate-pulse
                "
                >
                    JazzFlow AI is thinking...
                </div>
            )}


            {/* =========================
            INPUT AREA
        ========================= */}

            <div
                className="
                shrink-0
                w-full
                bg-[#0B0F19]
                border-t
                border-[#1F2937]
                px-3
                sm:px-4
                pt-3
                pb-[max(12px,env(safe-area-inset-bottom))]
            "
            >

                <div className="max-w-5xl mx-auto">

                    <div
                        className="
                        flex
                        items-end
                        gap-2
                        sm:gap-3
                        bg-[#111827]
                        border
                        border-[#263244]
                        rounded-2xl
                        px-3
                        sm:px-4
                        py-2
                        sm:py-3
                        shadow-lg
                    "
                    >

                        {/* PLUS */}

                        <button
                            type="button"
                            className="
                            shrink-0
                            w-9
                            h-9
                            flex
                            items-center
                            justify-center
                            rounded-lg
                            text-[#8A9FCE]
                            hover:text-white
                            hover:bg-[#1C2637]
                            transition
                        "
                        >
                            <Plus className="w-5 h-5" />
                        </button>


                        {/* TEXTAREA */}

                        <textarea
                            ref={textareaRef}
                            rows={1}
                            value={message}
                            onChange={handleInputChange}
                            onFocus={handleTextareaFocus}
                            onKeyDown={(e) => {

                                if (
                                    e.key === "Enter" &&
                                    !e.shiftKey
                                ) {
                                    e.preventDefault();
                                    handleSend();
                                }

                            }}
                            disabled={loading}
                            placeholder="Ask JazzFlow anything..."
                            className="
                            flex-1
                            min-w-0
                            resize-none
                            bg-transparent
                            outline-none
                            text-white
                            text-sm
                            sm:text-base
                            leading-6
                            placeholder:text-[#7F8EA3]
                            max-h-40
                            overflow-y-auto
                        "
                            style={{
                                WebkitOverflowScrolling: "touch",
                            }}
                        />


                        {/* SEND */}

                        <button
                            type="button"
                            onClick={handleSend}
                            disabled={
                                !message.trim() || loading
                            }
                            className="
                            shrink-0
                            flex
                            items-center
                            justify-center
                            w-10
                            h-10
                            rounded-xl
                            bg-[#329CEF]
                            hover:bg-[#2388db]
                            disabled:bg-[#374151]
                            disabled:cursor-not-allowed
                            transition
                        "
                        >

                            <SendHorizontal
                                className="w-5 h-5 text-white"
                            />

                        </button>

                    </div>

                </div>

            </div>

        </div>
    );


};

export default Main;
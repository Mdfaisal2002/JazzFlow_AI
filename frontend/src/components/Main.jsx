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

    const textareaRef = useRef(null);

    // =========================================
    // CREATE CHAT
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
    // SEND MESSAGE
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
            // 6. Send message
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
                // 8. Update AI response progressively
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
    // INPUT CHANGE
    // =========================================

    const handleInputChange = (e) => {

        setMessage(e.target.value);

        const textarea = textareaRef.current;

        if (!textarea) return;

        textarea.style.height = "auto";

        textarea.style.height =
            `${Math.min(textarea.scrollHeight, 200)}px`;
    };


    // =========================================
    // LOAD EXISTING CHAT
    // =========================================

    useEffect(() => {

        if (selectedChatId) {
            loadChat(selectedChatId);
        }

    }, [selectedChatId]);


    // =========================================
    // NEW CHAT
    // =========================================

    useEffect(() => {

        if (selectedChatId === null) {

            setChatId(null);
            setMessages([]);
            setMessage("");
            setLoading(false);

            if (textareaRef.current) {
                textareaRef.current.style.height = "auto";
            }
        }

    }, [selectedChatId]);


    // =========================================
    // LOAD CHAT
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


    // =========================================
    // GENERATE CHAT TITLE
    // =========================================

    const generateChatTitle = (text) => {

        const cleanText = text.trim();

        if (cleanText.length <= 40) {
            return cleanText;
        }

        return cleanText.substring(0, 40) + "...";
    };


    // =========================================
    // QUICK PROMPT
    // =========================================

    const handleQuickPrompt = (prompt) => {

        if (loading) return;

        setMessage(prompt);

        setTimeout(() => {
            textareaRef.current?.focus();
        }, 50);
    };


    return (

        <div className="
            flex
            flex-col
            h-screen
            max-h-screen
            min-w-0
            overflow-hidden
            bg-[#0B0F19]
            text-white
        ">


            {/* =====================================
                CHAT CONTENT
            ===================================== */}

            <div
                className="
                    flex-1
                    min-h-0
                    overflow-y-auto
                    overflow-x-hidden
                    scroll-smooth
                "
            >

                {/* =====================================
                    WELCOME SCREEN
                ===================================== */}

                {messages.length === 0 && (

                    <div
                        className="
                            min-h-full
                            flex
                            flex-col
                            justify-center
                            items-center
                            px-4
                            sm:px-6
                            py-10
                        "
                    >

                        {/* Welcome heading */}

                        <div
                            className="
                                text-center
                                max-w-3xl
                                mb-8
                                sm:mb-10
                            "
                        >

                            <div
                                className="
                                    inline-flex
                                    items-center
                                    px-3
                                    py-1.5
                                    mb-4
                                    rounded-full
                                    bg-[#172033]
                                    border
                                    border-[#263244]
                                    text-xs
                                    sm:text-sm
                                    text-[#ADC6FF]
                                "
                            >
                                AI-powered workspace
                            </div>


                            <h1
                                className="
                                    text-2xl
                                    sm:text-3xl
                                    md:text-4xl
                                    lg:text-5xl
                                    font-bold
                                    leading-tight
                                    tracking-tight
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
                                    mt-3
                                    sm:mt-4
                                    text-sm
                                    sm:text-base
                                    md:text-lg
                                    leading-relaxed
                                    text-[#929DB1]
                                    max-w-2xl
                                    mx-auto
                                "
                            >
                                Your professional AI partner for analysis,
                                strategy, coding, and deep insights.
                            </p>

                        </div>


                        {/* =====================================
                            QUICK ACTION CARDS
                        ===================================== */}

                        <div
                            className="
                                grid
                                grid-cols-1
                                sm:grid-cols-3
                                gap-3
                                sm:gap-4
                                w-full
                                max-w-5xl
                                mb-8
                            "
                        >

                            {/* Document */}

                            <button
                                onClick={() =>
                                    handleQuickPrompt(
                                        "Help me analyze a document and extract the most important information."
                                    )
                                }
                                className="
                                    group
                                    w-full
                                    text-left
                                    flex
                                    items-center
                                    sm:block
                                    gap-3
                                    p-4
                                    sm:p-5
                                    rounded-2xl
                                    bg-[#111827]
                                    border
                                    border-[#263244]
                                    hover:border-[#526A91]
                                    hover:bg-[#151F30]
                                    active:scale-[0.98]
                                    transition-all
                                    duration-200
                                "
                            >

                                <div
                                    className="
                                        w-11
                                        h-11
                                        shrink-0
                                        flex
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-[#1D2A3D]
                                        group-hover:bg-[#263A58]
                                        transition
                                    "
                                >
                                    <FileSearch
                                        className="
                                            w-5
                                            h-5
                                            text-[#ADC6FF]
                                        "
                                    />
                                </div>


                                <div className="min-w-0 sm:mt-4">

                                    <h2
                                        className="
                                            text-sm
                                            sm:text-base
                                            font-semibold
                                            text-[#DCE7F8]
                                        "
                                    >
                                        Analyze a document
                                    </h2>

                                    <p
                                        className="
                                            mt-1
                                            text-xs
                                            sm:text-sm
                                            leading-relaxed
                                            text-[#7F8EA3]
                                            line-clamp-2
                                        "
                                    >
                                        Summarize documents and extract
                                        important information.
                                    </p>

                                </div>

                            </button>


                            {/* Marketing */}

                            <button
                                onClick={() =>
                                    handleQuickPrompt(
                                        "Create a marketing strategy for my business."
                                    )
                                }
                                className="
                                    group
                                    w-full
                                    text-left
                                    flex
                                    items-center
                                    sm:block
                                    gap-3
                                    p-4
                                    sm:p-5
                                    rounded-2xl
                                    bg-[#111827]
                                    border
                                    border-[#263244]
                                    hover:border-[#526A91]
                                    hover:bg-[#151F30]
                                    active:scale-[0.98]
                                    transition-all
                                    duration-200
                                "
                            >

                                <div
                                    className="
                                        w-11
                                        h-11
                                        shrink-0
                                        flex
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-[#1D2A3D]
                                        group-hover:bg-[#263A58]
                                        transition
                                    "
                                >
                                    <ChartNoAxesCombined
                                        className="
                                            w-5
                                            h-5
                                            text-[#ADC6FF]
                                        "
                                    />
                                </div>


                                <div className="min-w-0 sm:mt-4">

                                    <h2
                                        className="
                                            text-sm
                                            sm:text-base
                                            font-semibold
                                            text-[#DCE7F8]
                                        "
                                    >
                                        Marketing strategy
                                    </h2>

                                    <p
                                        className="
                                            mt-1
                                            text-xs
                                            sm:text-sm
                                            leading-relaxed
                                            text-[#7F8EA3]
                                            line-clamp-2
                                        "
                                    >
                                        Build campaigns and strategies
                                        for your target audience.
                                    </p>

                                </div>

                            </button>


                            {/* Code */}

                            <button
                                onClick={() =>
                                    handleQuickPrompt(
                                        "Review my code, identify bugs, and suggest improvements."
                                    )
                                }
                                className="
                                    group
                                    w-full
                                    text-left
                                    flex
                                    items-center
                                    sm:block
                                    gap-3
                                    p-4
                                    sm:p-5
                                    rounded-2xl
                                    bg-[#111827]
                                    border
                                    border-[#263244]
                                    hover:border-[#526A91]
                                    hover:bg-[#151F30]
                                    active:scale-[0.98]
                                    transition-all
                                    duration-200
                                "
                            >

                                <div
                                    className="
                                        w-11
                                        h-11
                                        shrink-0
                                        flex
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-[#1D2A3D]
                                        group-hover:bg-[#263A58]
                                        transition
                                    "
                                >
                                    <Code2
                                        className="
                                            w-5
                                            h-5
                                            text-[#ADC6FF]
                                        "
                                    />
                                </div>


                                <div className="min-w-0 sm:mt-4">

                                    <h2
                                        className="
                                            text-sm
                                            sm:text-base
                                            font-semibold
                                            text-[#DCE7F8]
                                        "
                                    >
                                        Review my code
                                    </h2>

                                    <p
                                        className="
                                            mt-1
                                            text-xs
                                            sm:text-sm
                                            leading-relaxed
                                            text-[#7F8EA3]
                                            line-clamp-2
                                        "
                                    >
                                        Find bugs, improve performance,
                                        and refactor code.
                                    </p>

                                </div>

                            </button>

                        </div>


                        <p
                            className="
                                text-xs
                                text-[#65748A]
                                text-center
                            "
                        >
                            Press Enter to send · Shift + Enter for a new line
                        </p>

                    </div>
                )}


                {/* =====================================
                    AI / USER MESSAGES
                ===================================== */}

                {messages.length > 0 && (

                    <div
                        className="
                            w-full
                            max-w-4xl
                            mx-auto
                            px-3
                            sm:px-5
                            md:px-6
                            py-6
                            sm:py-8
                            space-y-5
                            sm:space-y-6
                        "
                    >

                        {messages.map((msg, index) => (

                            <div
                                key={index}
                                className={`
                                    flex
                                    w-full
                                    ${msg.role === "user"
                                        ? "justify-end"
                                        : "justify-start"
                                    }
                                `}
                            >

                                <div
                                    className={`
                                        w-fit
                                        max-w-[90%]
                                        sm:max-w-[80%]
                                        md:max-w-[75%]
                                        rounded-2xl
                                        px-4
                                        sm:px-5
                                        py-3
                                        sm:py-3.5
                                        shadow-md
                                        whitespace-pre-wrap
                                        break-words
                                        leading-relaxed

                                        ${msg.role === "user"
                                            ? `
                                                bg-[#329CEF]
                                                text-white
                                                rounded-br-md
                                            `
                                            : `
                                                bg-[#151E2D]
                                                border
                                                border-[#263244]
                                                text-[#E6EDF7]
                                                rounded-bl-md
                                            `
                                        }
                                    `}
                                >

                                    <p
                                        className={`
                                            text-[11px]
                                            sm:text-xs
                                            mb-1.5
                                            font-medium

                                            ${msg.role === "user"
                                                ? "text-blue-100"
                                                : "text-[#8290A5]"
                                            }
                                        `}
                                    >
                                        {msg.role === "user"
                                            ? "You"
                                            : "JazzFlow AI"
                                        }
                                    </p>


                                    <p
                                        className="
                                            text-sm
                                            sm:text-[15px]
                                        "
                                    >
                                        {msg.content}

                                        {loading &&
                                            msg.role === "assistant" &&
                                            index === messages.length - 1 && (
                                                <span
                                                    className="
                                                        animate-pulse
                                                        ml-1
                                                        text-[#ADC6FF]
                                                    "
                                                >
                                                    ▌
                                                </span>
                                            )
                                        }
                                    </p>

                                </div>

                            </div>

                        ))}

                    </div>
                )}

            </div>


            {/* =====================================
                THINKING INDICATOR
            ===================================== */}

            {loading && (

                <div
                    className="
                        w-full
                        max-w-4xl
                        mx-auto
                        px-4
                        sm:px-6
                        pb-2
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            gap-2
                            text-xs
                            sm:text-sm
                            text-[#7F8EA3]
                        "
                    >

                        <span className="flex gap-1">

                            <span
                                className="
                                    w-1.5
                                    h-1.5
                                    rounded-full
                                    bg-[#7F8EA3]
                                    animate-bounce
                                "
                            />

                            <span
                                className="
                                    w-1.5
                                    h-1.5
                                    rounded-full
                                    bg-[#7F8EA3]
                                    animate-bounce
                                    [animation-delay:150ms]
                                "
                            />

                            <span
                                className="
                                    w-1.5
                                    h-1.5
                                    rounded-full
                                    bg-[#7F8EA3]
                                    animate-bounce
                                    [animation-delay:300ms]
                                "
                            />

                        </span>

                        JazzFlow AI is thinking...

                    </div>

                </div>
            )}


            {/* =====================================
                INPUT AREA
            ===================================== */}

            <div
                className="
                    shrink-0
                    w-full
                    border-t
                    border-[#1F2937]
                    bg-[#0B0F19]/95
                    backdrop-blur-md
                    px-3
                    sm:px-4
                    pt-3
                    pb-[calc(0.75rem+env(safe-area-inset-bottom))]
                    sm:pb-4
                "
            >

                <div
                    className="
                        max-w-4xl
                        mx-auto
                    "
                >

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
                            py-2.5
                            sm:py-3
                            shadow-lg
                            focus-within:border-[#405675]
                            transition
                        "
                    >

                        {/* PLUS */}

                        <button
                            type="button"
                            disabled={loading}
                            className="
                                shrink-0
                                flex
                                items-center
                                justify-center
                                w-9
                                h-9
                                sm:w-10
                                sm:h-10
                                rounded-xl
                                text-[#8A9FCE]
                                hover:text-white
                                hover:bg-[#1D293A]
                                disabled:opacity-40
                                transition
                            "
                            aria-label="Add attachment"
                        >
                            <Plus
                                className="
                                    w-5
                                    h-5
                                    sm:w-5.5
                                    sm:h-5.5
                                "
                            />
                        </button>


                        {/* TEXTAREA */}

                        <textarea
                            ref={textareaRef}
                            rows={1}
                            value={message}
                            onChange={handleInputChange}
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
                                text-sm
                                sm:text-[15px]
                                leading-6
                                text-white
                                placeholder:text-[#718096]
                                max-h-40
                                overflow-y-auto
                                py-1
                            "
                        />


                        {/* SEND */}

                        <button
                            type="button"
                            onClick={handleSend}
                            disabled={
                                !message.trim() ||
                                loading
                            }
                            className="
                                shrink-0
                                flex
                                items-center
                                justify-center
                                w-10
                                h-10
                                sm:w-11
                                sm:h-11
                                rounded-xl
                                bg-[#329CEF]
                                hover:bg-[#2388DB]
                                active:scale-95
                                disabled:bg-[#263244]
                                disabled:text-[#596579]
                                disabled:cursor-not-allowed
                                transition-all
                            "
                            aria-label="Send message"
                        >

                            <SendHorizontal
                                className="
                                    w-5
                                    h-5
                                "
                            />

                        </button>

                    </div>


                    {/* INPUT FOOTNOTE */}

                    <p
                        className="
                            hidden
                            sm:block
                            text-center
                            text-[11px]
                            text-[#58667A]
                            mt-2
                        "
                    >
                        JazzFlow AI can make mistakes. Check important information.
                    </p>

                </div>

            </div>

        </div>
    );
};

export default Main;


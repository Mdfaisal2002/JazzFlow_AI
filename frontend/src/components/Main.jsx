import { FileSearch, Plus, SendHorizontal, ChartNoAxesCombined, Code2 } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import sendMessage from '../services/aiService.js'
import api from '../api/api.js'

const Main = ({
    chatId: selectedChatId,
    onChatCreated,
}) => {

    const [message, setMessage] = useState("")
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(false)
    const [chatId, setChatId] = useState(null)

    const textareaRef = useRef()

    const createChat = async (firstMessage) => {

        try {

            const title = generateChatTitle(firstMessage);

            const response = await api.post("/ai/chat/", {
                title
            });

            const newChatId = response.data.chat._id;

            // Store locally inside Main
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


    // const handleSend = async () => {

    //     if (!message.trim()) return;


    //     //add user msg
    //     setMessages(prev =>
    //         [
    //             ...prev,
    //             {
    //                 role: "user",
    //                 text: message
    //             }
    //         ])

    //     //loading
    //     setLoading(true)

    //     //clear the input box
    //     setMessage("")

    //     if (textareaRef.current) {
    //         textareaRef.current.style.height = "auto"
    //     }

    //     try {
    //         //get AI reply
    //         const reply = await sendMessage(message)

    //         //add AI reply
    //         setMessages(prev => [
    //             ...prev,
    //             {
    //                 role: "assistant",
    //                 text: reply
    //             }
    //         ])
    //         console.log(reply)
    //     }
    //     catch (error) {
    //         console.log(error.message)
    //     }
    //     finally {
    //         setLoading(false)
    //     }
    // }

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
            // 3. Add user message immediately
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
            // 5. Tell Sidebar to refresh history
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


    const handleInputChange = (e) => {
        setMessage(e.target.value)

        const textarea = textareaRef.current


        if (!textarea) return;

        // Reset height
        textarea.style.height = "auto"

        //Grow to fit content upto 200px
        textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }

    // Load an existing chat
    useEffect(() => {

        if (selectedChatId) {
            loadChat(selectedChatId);
        }

    }, [selectedChatId]);


    // New Chat
    useEffect(() => {

        if (selectedChatId === null) {
            setChatId(null);
            setMessages([]);
        }

    }, [selectedChatId]);

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

    const generateChatTitle = (text) => {
        const cleanText = text.trim();

        if (cleanText.length <= 40) {
            return cleanText;
        }

        return cleanText.substring(0, 40) + "...";
    };

    return (
        <div className="flex flex-col bg-[#0B0F19] h-screen max-h-screen sm:px-4 lg:px-6 ">
            <div className="flex-1 overflow-auto">
                {/* heading */}
                {messages.length == 0 && (
                    <div className="flex flex-col justify-center items-center min-h-full">
                        <div className="text-center mb-10">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl mb-2 font-bold text-[#D4E4FA] text-center">How can <span className="text-[#ADC6FF]">JazzFlow</span> help today?</h1>
                            <p className="max-w-2xl mx-auto text-center text-sm sm:text-base text-[#ccd2e2] ">Your professional AI partner for analysis, stratagy, and deep insights.</p>
                        </div>

                        {/* cards */}
                        {messages.length == 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-4 w-full max-w-6xl mb-20 ">
                                <div className=" flex gap-2 md:block items-center p-1 group bg-[#1C2637] md:p-5 rounded-xl mx-4 hover:-translate-y-2 transition delay-75 border-2 border-transparent  hover:border-[#b7cbf7] ">
                                    <FileSearch className="w-10 h-10 text-[#8A9FCE] bg-[#2B3649] rounded-xl p-2 m-2  group-hover:bg-[#b7cbf7] group-hover:text-[#2B3649] " />
                                    <h1 className="text-[#C9D8ED] py-2 text-lg sm:xl font-bold">Analyze a document</h1>
                                    <p className="hidden md:block text-[#9298A8]">Upload PDFs for rapid summarization and deep data extraction.</p>
                                </div>
                                <div className="group flex gap-2 md:block items-center p-1 bg-[#1C2637] md:p-5 rounded-xl mx-4 hover:-translate-y-2 transition delay-75 border-2 border-transparent  hover:border-[#b7cbf7] ">
                                    <ChartNoAxesCombined className="w-10 h-10 text-[#8A9FCE] bg-[#2B3649] rounded-xl p-2 m-2 group-hover:bg-[#b7cbf7] group-hover:text-[#2B3649] " />
                                    <h1 className="text-[#C9D8ED] py-2 text-xl font-bold">Marketing strategy</h1>
                                    <p className="hidden md:block text-[#9298A8]">Generate omni-channel campaigns based on target personas.</p>
                                </div>
                                <div className="group flex gap-2 md:block items-center p-1 bg-[#1C2637] md:p-5 rounded-xl mx-4 hover:-translate-y-2 transition delay-75 border-2 border-transparent  hover:border-[#b7cbf7] ">
                                    <Code2 className="w-10 h-10 text-[#8A9FCE] bg-[#2B3649] rounded-xl p-2 m-2  group-hover:bg-[#b7cbf7] group-hover:text-[#2B3649] " />
                                    <h1 className="text-[#C9D8ED] py-2 text-xl font-bold">Review my code</h1>
                                    <p className="hidden md:block text-[#9298A8]">Identify bugs, optimize performance, and refactor architecture.</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* AI Response */}
                {messages.length > 0 && (
                    <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-6">
                        {messages.map((msg, index) => (
                            <div key={index}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div className={`max-w-[80%] rounded-2xl px-5 py-3 shadow-md  whitespace-pre-wrap

                                    ${msg.role === "user"

                                        ? "bg-[#329CEF] text-white"

                                        : "bg-[#1C2637] text-[#E6EDF7]"
                                    }`}>
                                    <p className="text-sm mb-2 opacity-70">
                                        {msg.role === "user" ? "You" : "JazzFlow AI"}
                                    </p>
                                    <p>{msg.content}
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

            {/* Loading indication */}
            {
                loading && (
                    <div className="text-slate-400 animate-pulse">
                        JazzFlow AI is thinking...
                    </div>
                )
            }

            {/* ==================== Input Box ==================== */}
            <div className="sticky bottom-0 w-full border-t border-[#1F2937] bg-[#0B0F19] px-4 py-4">

                <div className="max-w-5xl mx-auto">

                    <div className="flex items-center gap-3 bg-[#111827] border border-[#263244] rounded-2xl px-4 py-3 shadow-lg">

                        {/* Plus Button */}
                        <button className="text-[#8A9FCE] hover:text-white transition">
                            <Plus className="w-6 h-6" />
                        </button>

                        {/* Input */}
                        <textarea
                            ref={textareaRef}
                            rows={1}
                            value={message}
                            onChange={handleInputChange}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            disabled={loading}
                            placeholder="Ask JazzFlow anything..."
                            className="
                            flex-1
                            resize-none
                            bg-transparent
                            outline-none
                            text-white
                            placeholder:text-[#7F8EA3]
                            max-h-40
                            overflow-y-auto"
                        />

                        {/* Send Button */}
                        <button
                            onClick={handleSend}
                            disabled={!message.trim()}
                            className="
                                flex
                                items-center
                                justify-center
                                w-11
                                h-11
                                rounded-xl
                                bg-[#329CEF]
                                hover:bg-[#2388db]
                                disabled:bg-[#374151]
                                disabled:cursor-not-allowed
                                transition
                            "
                        >
                            <SendHorizontal className="w-5 h-5 text-white" />
                        </button>

                    </div>

                </div>

            </div>

        </div>
    )
}

export default Main;
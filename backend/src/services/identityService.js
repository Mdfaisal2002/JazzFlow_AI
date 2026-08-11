const identityService = (message) => {
    const text = message
        .toLowerCase()
        .trim()
        .replace(/[?!.,]/g, "")
        .replace(/\s+/g, " ");

    // =========================================
    // NAME
    // =========================================

    const namePatterns = [
        "what is your name",
        "what's your name",
        "what your name",
        "what is ur name",
        "what ur name",
        "your name",
        "tell me your name",
        "may i know your name",
        "can i know your name",
        "what do i call you",
        "what should i call you"
    ];

    if (
        namePatterns.some((pattern) =>
            text.includes(pattern)
        )
    ) {
        return "My name is JazzFlow AI.";
    }


    // =========================================
    // WHO ARE YOU
    // =========================================

    const whoPatterns = [
        "who are you",
        "who r you",
        "who are u",
        "who r u",
        "tell me about yourself",
        "what are you",
        "what r you"
    ];

    if (
        whoPatterns.some((pattern) =>
            text.includes(pattern)
        )
    ) {
        return "I am JazzFlow AI, an AI assistant created by MdFaisal. I am designed to help with questions, coding, analysis, ideas, and conversations.";
    }


    // =========================================
    // CREATOR
    // =========================================

    const creatorPatterns = [
        "who created you",
        "who made you",
        "who is your creator",
        "who built you",
        "who developed you",
        "who is your developer",
        "who created jazzflow",
        "who made jazzflow",
        "who is behind jazzflow",
        "who owns jazzflow"
    ];

    if (
        creatorPatterns.some((pattern) =>
            text.includes(pattern)
        )
    ) {
        return "I was created by MdFaisal as part of the JazzFlow AI project.";
    }


    // =========================================
    // GOOGLE
    // =========================================

    const googlePatterns = [
        "are you google",
        "were you created by google",
        "did google create you",
        "is google your creator",
        "are you a google ai",
        "are you google ai",
        "is google your developer",
        "was google your creator"
    ];

    if (
        googlePatterns.some((pattern) =>
            text.includes(pattern)
        )
    ) {
        return "No. I am JazzFlow AI, created by MdFaisal. JazzFlow AI uses AI technology to generate responses, but I am not a Google-created assistant.";
    }


    // =========================================
    // WHY JAZZFLOW
    // =========================================

    const jazzFlowPatterns = [
        "why is your name jazzflow",
        "why are you called jazzflow",
        "why your name is jazzflow",
        "why jazzflow",
        "why is it called jazzflow",
        "why the name jazzflow",
        "what does jazzflow mean",
        "meaning of jazzflow",
        "why did he call you jazzflow"
    ];

    if (
        jazzFlowPatterns.some((pattern) =>
            text.includes(pattern)
        )
    ) {
        return "My name is JazzFlow because Jazz is the name that inspired my creator. His future wife's name is Jazz, and she is a very talkative person who can talk anytime, anywhere, and about any topic. Because JazzFlow is designed around conversation and the flow of ideas, he chose the name JazzFlow.";
    }


    // =========================================
    // NO MATCH
    // =========================================

    return null;
};

export default identityService;


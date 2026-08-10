import { useEffect, useState } from "react";
import {
    ArrowLeft,
    Sparkles,
    Activity,
    Database,
    Info,
    CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getUsage } from "../services/usageService";


function Settings() {

    const navigate = useNavigate();


    // =========================
    // Usage State
    // =========================

    const [usage, setUsage] = useState({
        requestsUsed: 0,
        remaining: 500,
        dailyLimit: 500,
    });


    // =========================
    // Load Usage
    // =========================

    useEffect(() => {

        const loadUsage = async () => {

            try {

                const data = await getUsage();

                setUsage({
                    requestsUsed: data.requestsUsed,
                    remaining: data.remaining,
                    dailyLimit: data.dailyLimit || 500,
                });

            } catch (error) {

                console.log("Usage error:", error.message);

            }

        };


        loadUsage();

    }, []);


    // =========================
    // Usage Percentage
    // =========================

    const usagePercentage =
        usage.dailyLimit > 0
            ? Math.min(
                (usage.requestsUsed / usage.dailyLimit) * 100,
                100
            )
            : 0;


    // =========================
    // Scroll Navigation
    // =========================

    const scrollToSection = (id) => {

        const section = document.getElementById(id);

        if (section) {

            section.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });

        }

    };


    return (

        <div className="min-h-screen bg-[#0B0F19] text-white">


            {/* =====================================================
                TOP HEADER
            ====================================================== */}

            <header
                className="
                    sticky
                    top-0
                    z-40
                    h-16
                    flex
                    items-center
                    justify-between
                    px-4
                    sm:px-6
                    bg-[#0B0F19]/95
                    backdrop-blur
                    border-b
                    border-slate-800
                "
            >

                {/* Back Button */}

                <button
                    onClick={() => navigate("/")}
                    className="
                        flex
                        items-center
                        gap-2
                        px-2
                        py-2
                        rounded-lg
                        text-slate-400
                        hover:text-white
                        hover:bg-slate-800
                        transition
                    "
                >

                    <ArrowLeft className="w-5 h-5" />

                    <span className="text-sm">
                        Back
                    </span>

                </button>


                {/* Title */}

                <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-semibold">
                    Settings
                </h1>


                {/* Right Spacer */}

                <div className="w-16" />

            </header>



            {/* =====================================================
                MAIN CONTENT
            ====================================================== */}

            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">


                <div
                    className="
                        grid
                        grid-cols-1
                        md:grid-cols-[180px_minmax(0,1fr)]
                        gap-8
                        lg:gap-12
                    "
                >


                    {/* =================================================
                        SETTINGS NAVIGATION
                    ================================================== */}

                    <aside className="hidden md:block">

                        <nav
                            className="
                                sticky
                                top-24
                                space-y-1
                            "
                        >


                            {/* General */}

                            <button
                                onClick={() =>
                                    scrollToSection("general")
                                }
                                className="
                                    w-full
                                    text-left
                                    px-3
                                    py-2.5
                                    rounded-lg
                                    bg-slate-800
                                    text-white
                                    text-sm
                                    font-medium
                                    hover:bg-slate-700
                                    transition
                                "
                            >
                                General
                            </button>


                            {/* AI Model */}

                            <button
                                onClick={() =>
                                    scrollToSection("ai-model")
                                }
                                className="
                                    w-full
                                    text-left
                                    px-3
                                    py-2.5
                                    rounded-lg
                                    text-slate-400
                                    hover:bg-slate-800
                                    hover:text-white
                                    text-sm
                                    transition
                                "
                            >
                                AI & Model
                            </button>


                            {/* Usage */}

                            <button
                                onClick={() =>
                                    scrollToSection("usage")
                                }
                                className="
                                    w-full
                                    text-left
                                    px-3
                                    py-2.5
                                    rounded-lg
                                    text-slate-400
                                    hover:bg-slate-800
                                    hover:text-white
                                    text-sm
                                    transition
                                "
                            >
                                Usage
                            </button>


                            {/* About */}

                            <button
                                onClick={() =>
                                    scrollToSection("about")
                                }
                                className="
                                    w-full
                                    text-left
                                    px-3
                                    py-2.5
                                    rounded-lg
                                    text-slate-400
                                    hover:bg-slate-800
                                    hover:text-white
                                    text-sm
                                    transition
                                "
                            >
                                About
                            </button>


                        </nav>

                    </aside>



                    {/* =================================================
                        SETTINGS CONTENT
                    ================================================== */}

                    <section className="min-w-0 max-w-2xl">


                        {/* =================================================
                            GENERAL
                        ================================================== */}

                        <section
                            id="general"
                            className="scroll-mt-24"
                        >

                            <div>

                                <h2 className="text-2xl font-semibold">
                                    General
                                </h2>

                                <p className="text-sm text-slate-500 mt-1">
                                    Manage your JazzFlow AI preferences.
                                </p>

                            </div>


                            <div className="mt-8 border-t border-slate-800">


                                {/* Appearance */}

                                <div
                                    className="
                                        flex
                                        items-center
                                        justify-between
                                        gap-4
                                        py-5
                                        border-b
                                        border-slate-800
                                    "
                                >

                                    <div>

                                        <p className="text-sm font-medium text-slate-200">
                                            Appearance
                                        </p>

                                        <p className="text-xs text-slate-500 mt-1">
                                            Choose how JazzFlow looks.
                                        </p>

                                    </div>


                                    <div
                                        className="
                                            shrink-0
                                            px-3
                                            py-2
                                            rounded-lg
                                            bg-slate-800
                                            border
                                            border-slate-700
                                            text-sm
                                            text-slate-300
                                        "
                                    >
                                        Dark
                                    </div>

                                </div>



                                {/* Application Version */}

                                <div
                                    className="
                                        flex
                                        items-center
                                        justify-between
                                        gap-4
                                        py-5
                                        border-b
                                        border-slate-800
                                    "
                                >

                                    <div>

                                        <p className="text-sm font-medium text-slate-200">
                                            Application
                                        </p>

                                        <p className="text-xs text-slate-500 mt-1">
                                            Current JazzFlow AI version.
                                        </p>

                                    </div>


                                    <span className="text-sm text-slate-400">
                                        v1.0.0
                                    </span>

                                </div>


                            </div>

                        </section>



                        {/* =================================================
                            AI MODEL
                        ================================================== */}

                        <section
                            id="ai-model"
                            className="mt-16 scroll-mt-24"
                        >


                            <div className="flex items-start gap-3">

                                <div
                                    className="
                                        flex
                                        items-center
                                        justify-center
                                        w-9
                                        h-9
                                        rounded-lg
                                        bg-[#329CEF]/10
                                        shrink-0
                                    "
                                >

                                    <Sparkles className="w-5 h-5 text-[#329CEF]" />

                                </div>


                                <div>

                                    <h2 className="text-xl font-semibold">
                                        AI & Model
                                    </h2>

                                    <p className="text-sm text-slate-500 mt-1">
                                        Information about the AI powering your conversations.
                                    </p>

                                </div>

                            </div>



                            {/* Model Card */}

                            <div
                                className="
                                    mt-6
                                    border
                                    border-slate-800
                                    rounded-xl
                                    overflow-hidden
                                    bg-[#111827]
                                "
                            >

                                <div
                                    className="
                                        flex
                                        flex-col
                                        sm:flex-row
                                        sm:items-center
                                        sm:justify-between
                                        gap-4
                                        p-5
                                    "
                                >

                                    <div>

                                        <p className="text-sm font-medium text-slate-200">
                                            Current model
                                        </p>

                                        <p className="text-xs text-slate-500 mt-1">
                                            Fast and efficient conversational model.
                                        </p>

                                    </div>


                                    <div
                                        className="
                                            self-start
                                            sm:self-auto
                                            px-3
                                            py-2
                                            rounded-lg
                                            bg-slate-800
                                            border
                                            border-slate-700
                                            text-xs
                                            text-slate-300
                                        "
                                    >
                                        Gemini 3.5 Flash Lite
                                    </div>

                                </div>



                                {/* Model Status */}

                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-3
                                        px-5
                                        py-4
                                        border-t
                                        border-slate-800
                                    "
                                >

                                    <CheckCircle2 className="w-4 h-4 text-green-400" />

                                    <span className="text-sm text-slate-400">
                                        AI service is available
                                    </span>

                                </div>

                            </div>

                        </section>



                        {/* =================================================
                            USAGE
                        ================================================== */}

                        <section
                            id="usage"
                            className="mt-16 scroll-mt-24"
                        >


                            <div className="flex items-start gap-3">

                                <div
                                    className="
                                        flex
                                        items-center
                                        justify-center
                                        w-9
                                        h-9
                                        rounded-lg
                                        bg-[#329CEF]/10
                                        shrink-0
                                    "
                                >

                                    <Activity className="w-5 h-5 text-[#329CEF]" />

                                </div>


                                <div>

                                    <h2 className="text-xl font-semibold">
                                        Usage
                                    </h2>

                                    <p className="text-sm text-slate-500 mt-1">
                                        Monitor your daily Gemini API usage.
                                    </p>

                                </div>

                            </div>



                            {/* Usage Card */}

                            <div
                                className="
                                    mt-6
                                    p-5
                                    rounded-xl
                                    border
                                    border-slate-800
                                    bg-[#111827]
                                "
                            >


                                {/* Usage Numbers */}

                                <div
                                    className="
                                        flex
                                        flex-col
                                        sm:flex-row
                                        sm:items-end
                                        sm:justify-between
                                        gap-4
                                    "
                                >

                                    <div>

                                        <p className="text-xs text-slate-500">
                                            Requests used today
                                        </p>


                                        <p className="text-3xl font-semibold mt-1">

                                            {usage.requestsUsed}

                                            <span className="text-sm text-slate-500 font-normal">
                                                {" "} / {usage.dailyLimit}
                                            </span>

                                        </p>

                                    </div>


                                    <div className="sm:text-right">

                                        <p className="text-xs text-slate-500">
                                            Remaining
                                        </p>

                                        <p className="text-lg font-medium text-green-400">
                                            {usage.remaining}
                                        </p>

                                    </div>

                                </div>



                                {/* Progress */}

                                <div className="mt-6">

                                    <div
                                        className="
                                            h-2
                                            w-full
                                            rounded-full
                                            bg-slate-800
                                            overflow-hidden
                                        "
                                    >

                                        <div
                                            className="
                                                h-full
                                                rounded-full
                                                bg-[#329CEF]
                                                transition-all
                                                duration-500
                                            "
                                            style={{
                                                width: `${usagePercentage}%`,
                                            }}
                                        />

                                    </div>


                                    <div className="flex justify-between mt-2">

                                        <span className="text-xs text-slate-600">
                                            0 requests
                                        </span>

                                        <span className="text-xs text-slate-600">
                                            {usage.dailyLimit} requests
                                        </span>

                                    </div>

                                </div>


                            </div>

                        </section>



                        {/* =================================================
                            ABOUT
                        ================================================== */}

                        <section
                            id="about"
                            className="mt-16 scroll-mt-24"
                        >


                            <div className="flex items-start gap-3">

                                <div
                                    className="
                                        flex
                                        items-center
                                        justify-center
                                        w-9
                                        h-9
                                        rounded-lg
                                        bg-[#329CEF]/10
                                        shrink-0
                                    "
                                >

                                    <Info className="w-5 h-5 text-[#329CEF]" />

                                </div>


                                <div>

                                    <h2 className="text-xl font-semibold">
                                        About
                                    </h2>

                                    <p className="text-sm text-slate-500 mt-1">
                                        Information about your JazzFlow AI application.
                                    </p>

                                </div>

                            </div>



                            {/* About Card */}

                            <div
                                className="
                                    mt-6
                                    border
                                    border-slate-800
                                    rounded-xl
                                    overflow-hidden
                                    bg-[#111827]
                                "
                            >


                                {/* Application */}

                                <div
                                    className="
                                        flex
                                        items-center
                                        justify-between
                                        gap-4
                                        p-5
                                    "
                                >

                                    <div className="flex items-center gap-4">

                                        <div
                                            className="
                                                flex
                                                items-center
                                                justify-center
                                                w-10
                                                h-10
                                                rounded-lg
                                                bg-slate-800
                                            "
                                        >

                                            <Sparkles className="w-5 h-5 text-slate-400" />

                                        </div>


                                        <div>

                                            <p className="text-sm font-medium text-slate-200">
                                                JazzFlow AI
                                            </p>

                                            <p className="text-xs text-slate-500 mt-1">
                                                AI-powered conversational assistant
                                            </p>

                                        </div>

                                    </div>


                                    <span className="text-xs text-slate-500">
                                        v1.0.0
                                    </span>

                                </div>



                                {/* Backend */}

                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-4
                                        p-5
                                        border-t
                                        border-slate-800
                                    "
                                >

                                    <div
                                        className="
                                            flex
                                            items-center
                                            justify-center
                                            w-10
                                            h-10
                                            rounded-lg
                                            bg-slate-800
                                        "
                                    >

                                        <Database className="w-5 h-5 text-slate-400" />

                                    </div>


                                    <div className="flex-1">

                                        <p className="text-sm font-medium text-slate-200">
                                            Backend services
                                        </p>

                                        <p className="text-xs text-slate-500 mt-1">
                                            API and database services
                                        </p>

                                    </div>


                                    <span
                                        className="
                                            flex
                                            items-center
                                            gap-2
                                            text-xs
                                            text-green-400
                                        "
                                    >

                                        <span className="w-2 h-2 rounded-full bg-green-400" />

                                        Operational

                                    </span>

                                </div>



                                {/* Provider */}

                                <div
                                    className="
                                        flex
                                        items-center
                                        justify-between
                                        gap-4
                                        p-5
                                        border-t
                                        border-slate-800
                                    "
                                >

                                    <span className="text-sm text-slate-400">
                                        AI Provider
                                    </span>

                                    <span className="text-sm text-slate-300">
                                        Google Gemini
                                    </span>

                                </div>


                            </div>

                        </section>



                        {/* Bottom spacing */}

                        <div className="h-24" />


                    </section>

                </div>

            </main>

        </div>

    );

}


export default Settings;


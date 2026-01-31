import React, { useState } from 'react';

type Flashcard = {
    question: string;
    answer: string;
};

const DOMAINS = [
    "Ogólna",
    "Programowanie",
    "Medycyna",
    "Historia",
    "Prawo",
    "Biznes",
    "Nauki ścisłe",
    "Języki obce"
];

export default function FlashcardApp() {
    const [text, setText] = useState("");
    const [domain, setDomain] = useState(DOMAINS[0]);
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!text.trim()) return;
        setLoading(true);
        setError(null);
        setFlashcards([]);

        try {
            const res = await fetch('/api/generate-flashcards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, domain }),
            });

            if (!res.ok) {
                throw new Error(`Error: ${res.statusText}`);
            }

            const data = await res.json();
            if (data.error) {
                throw new Error(data.error);
            }

            setFlashcards(data.flashcards || []);
        } catch (err: any) {
            setError(err.message || "Failed to generate");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            {/* Input Section */}
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 shadow-2xl">
                <h2 className="text-3xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    FlashCardsMemory
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Treść materiału</label>
                        <div className="relative">
                            <textarea
                                className="w-full h-48 bg-gray-800 border border-gray-600 rounded-xl p-4 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                                placeholder="Wklej tutaj tekst, z którego chcesz utworzyć fiszki..."
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                maxLength={5000}
                            />
                            <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                                {text.length}/5000
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-200 mb-2">Dziedzina</label>
                            <select
                                value={domain}
                                onChange={(e) => setDomain(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                            >
                                {DOMAINS.map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={handleGenerate}
                                disabled={loading || !text}
                                className={`w-full sm:w-auto px-8 py-3 rounded-xl font-semibold text-white transition-all transform hover:scale-105 active:scale-95 shadow-lg cursor-pointer
                  ${loading || !text
                                        ? 'bg-gray-700 cursor-not-allowed opacity-50'
                                        : 'bg-indigo-600 hover:bg-indigo-500'}`
                                }
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Generowanie...
                                    </span>
                                ) : (
                                    "Generuj Fiszki"
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mt-4 p-4 bg-red-900/50 border border-red-500 text-red-200 rounded-xl">
                        {error}
                    </div>
                )}
            </div>

            {/* Results Section */}
            {flashcards.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                    {flashcards.map((card, idx) => (
                        <div key={idx} className="group">
                            <div className="h-full bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden flex flex-col">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-bl-full -mr-12 -mt-12 transition-all group-hover:bg-purple-500/20"></div>

                                <div className="mb-4">
                                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Pytanie</span>
                                    <h3 className="text-lg font-medium text-white mt-2">{card.question}</h3>
                                </div>

                                <div className="mt-auto pt-4 border-t border-gray-700/50">
                                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Odpowiedź</span>
                                    <p className="text-gray-300 mt-2 leading-relaxed">{card.answer}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Head from "next/head";

const ThemeToggle = ({ theme, setTheme }: { theme: string; setTheme: (theme: string) => void }) => {
  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");

    // Change background color based on theme
    document.body.style.backgroundColor = theme === "dark" ? "#1a202c" : "#f3f4f6"; // Tailwind dark:bg-gray-900 and light:bg-gray-100
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 px-4 py-2 bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded-md shadow-md hover:bg-gray-400 dark:hover:bg-gray-600 transition"
    >
      {theme === "light" ? "Dark Mode" : "Light Mode"}
    </button>
  );
};


export default function Home() {
  const [text, setText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("hi");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") || "light";
    setTheme(storedTheme);
  }, []);


  // Separate loading states
  const [translating, setTranslating] = useState(false);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [asrLoading, setAsrLoading] = useState(false);

   const languages = [
    { code: "as", label: "Assamese" },
    { code: "bn", label: "Bengali" },
    { code: "brx", label: "Bodo" },
    { code: "doi", label: "Dogri" },
    { code: "en", label: "English" },
    { code: "gom", label: "Konkani" },
    { code: "hi", label: "Hindi" },
    { code: "ks", label: "Kashmiri" },
    { code: "mai", label: "Maithili" },
    { code: "ml", label: "Malayalam" },
    { code: "mr", label: "Marathi" },
    { code: "mni", label: "Manipuri" },
    { code: "ne", label: "Nepali" },
    { code: "or", label: "Odia" },
    { code: "pa", label: "Punjabi" },
    { code: "sa", label: "Sanskrit" },
    { code: "sat", label: "Santali" },
    { code: "sd", label: "Sindhi" },
    { code: "ta", label: "Tamil" },
    { code: "te", label: "Telugu" },
    { code: "ur", label: "Urdu" },
  ];


  const handleTranslate = async () => {
    try {
      setTranslating(true);
      setTranslatedText(""); // Reset previous translation before new request

      const response = await axios.post("https://bhashini-python-frd9.onrender.com/translate", {
        source_language: sourceLang,
        target_language: targetLang,
        text: text,
      });

      setTranslatedText(response.data.translated_text);
    } catch (error) {
      console.error("Translation error:", error);
    } finally {
      setTranslating(false);
    }
  };

 const handleTextToSpeech = async () => {
    setTtsLoading(true);
    try {
      const response = await axios.post("https://bhashini-python-frd9.onrender.com/tts", {
        source_language: sourceLang,
        target_language: targetLang,
        text: text,
      });

      const audioBase64 = response.data.audio_base64;
      const audioBlob = new Blob([
        new Uint8Array(atob(audioBase64).split("").map((char) => char.charCodeAt(0))),
      ], { type: "audio/wav" });
      
      const newAudioUrl = URL.createObjectURL(audioBlob);
      setAudioUrl(newAudioUrl);
      new Audio(newAudioUrl).play();
    } catch (error) {
      console.error("TTS error:", error);
    } finally {
      setTtsLoading(false);
    }
  };

  const handleASR = async () => {
    setAsrLoading(true);
    if (!audioFile) {
      console.error("No audio file selected");
      setAsrLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("audio_file", audioFile);
      formData.append("source_language", sourceLang);
      formData.append("target_language", targetLang);

      const response = await axios.post("https://bhashini-python-frd9.onrender.com/asr_nmt", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setTranslatedText(response.data.translated_text || "Error: No translated text returned from ASR");
    } catch (error) {
      console.error("ASR error:", error);
    } finally {
      setAsrLoading(false);
    }
  };

 return (
  <div 
    className="min-h-screen flex flex-col items-center justify-center p-2 transition-colors duration-500 bg-cover bg-center mt-[-10px]" 
    style={{ backgroundImage: "url('/background.jpg')" }}>
    <Head>
      <link href="https://db.onlinewebfonts.com/c/cd88cb7fee9e817fb5d3c577de740941?family=Restore+W00+Black" rel="stylesheet"/>
      <title>AgriVaani</title>
    </Head>

    {/* Logo at Top Left */}
    <div className="fixed top-2 left-2">
      <img 
        src="/logo with iso.png" 
        alt="Logo" 
        className="h-12 w-42 bg-white p-0.5 rounded"
      />
      <p className="text-sm mt-2 text-black dark:text-white">
        Powered by <span className="font-semibold">BHASHINI API</span>
      </p>
    </div>

    <h1 
      className="text-5xl font-bold mb-4" 
      style={{ 
        fontFamily: "'CamporaClassicHeavy'", 
        fontWeight: 900, 
        letterSpacing: "-3px" 
      }}>
      <span className="text-green-600">AGRI</span>
      <span className="text-red-600">VAANI</span>
    </h1>

    <ThemeToggle theme={theme} setTheme={setTheme} />

    <div className="w-full max-w-[800px] bg-gray-200 dark:bg-gray-800 shadow-lg rounded-lg p-3 flex space-x-4 border-2 border-gray-400 dark:border-gray-600 mt[-80px]"> 
      {/* Left Section: Input */}
      <div className="w-1/2 flex flex-col space-y-4">
        <div className="flex space-x-2">
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            className="w-1/2 p-2 border-2 border-gray-400 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 rounded"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="w-1/2 p-2 border-2 border-gray-400 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 rounded"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        <textarea
          className="w-full p-3 border-2 border-gray-400 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-700"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to translate"
          rows={4}
        />

        <button
          onClick={handleTranslate}
          className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 border-2 border-gray-500 dark:border-gray-700"
          disabled={translating}
        >
          {translating ? "Translating..." : "Translate text"}
        </button>

        {/* TTS Button */}
        <button
          onClick={handleTextToSpeech}
          className="mt-4 w-full bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 border-2 border-gray-500 dark:border-gray-700"
          disabled={ttsLoading}
        >
          {ttsLoading ? "Generating..." : "Generate Audio"}
        </button>
      </div>

      {/* Right Section: Translated Output */}
      <div className="w-1/2 p-4 border-2 border-gray-400 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700">
        <h2 className="text-lg font-semibold">Translation:</h2>
        <p className="mt-2">{translatedText || "Your translated text will appear here."}</p>
        {audioUrl && <audio controls src={audioUrl} className="w-full mt-2 rounded-lg shadow-md" />}
      </div>
    </div>

    {/* ASR Section */}
<div className="mt-6 w-full max-w-[800px] bg-gray-200 dark:bg-gray-800 shadow-lg rounded-lg p-3 border-2 border-gray-400 dark:border-gray-600 mt[-80px]"> 
  <div className="flex items-center space-x-4">
    <h2 className="text-lg font-semibold">Speech Recognition (ASR)</h2>
    <input
      type="file"
      accept="audio/*"
      onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
      className="p-1 border-2 border-gray-400 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-700"
    />
  </div>
  <button
    onClick={handleASR}
    className="mt-4 w-full bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 border-2 border-gray-500 dark:border-gray-700"
    disabled={asrLoading || !audioFile}
  >
    {asrLoading ? "Processing..." : "Transcribe Audio"}
  </button>
</div>

  </div>
);
}

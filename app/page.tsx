
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Head from "next/head";

const ThemeToggle = ({ theme, setTheme }) => {
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") || "light";
    setTheme(storedTheme);
    document.documentElement.classList.toggle("dark", storedTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
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


  // Separate loading states
  const [translating, setTranslating] = useState(false);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [asrLoading, setAsrLoading] = useState(false);

  const languages = [
    { code: "as", label: "Assamese" },
    { code: "bn", label: "Bengali" },
    { code: "en", label: "English" },
    { code: "hi", label: "Hindi" },
    { code: "ml", label: "Malayalam" },
    { code: "mr", label: "Marathi" },
    { code: "ne", label: "Nepali" },
    { code: "or", label: "Odia" },
    { code: "pa", label: "Punjabi" },
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
<div className={`min-h-screen flex flex-col items-center justify-center ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      } p-6`}>      
      <Head>
        <title>AgriVaani</title>
      </Head>

      <h1 className="text-3xl font-bold mb-4">AgriVaani</h1>
      <ThemeToggle />

      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 flex space-x-4">
        {/* Left Section: Input */}
        <div className="w-1/2 flex flex-col space-y-4">
          <div className="flex space-x-2">
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className="w-1/2 p-2 rounded border bg-gray-50 dark:bg-gray-700"
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
              className="w-1/2 p-2 rounded border bg-gray-50 dark:bg-gray-700"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <textarea
            className="w-full p-3 border rounded bg-gray-50 dark:bg-gray-700"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to translate"
            rows={4}
          />

          <button
            onClick={handleTranslate}
            className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
            disabled={translating}
          >
            {translating ? "Translating..." : "Translate text"}
          </button>
        </div>

        {/* Right Section: Translated Output */}
        <div className="w-1/2 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700">
          <h2 className="text-lg font-semibold">Translation:</h2>
          <p className="mt-2">{translatedText || "Your translated text will appear here."}</p>

          {/* TTS Button */}
          <button
            onClick={handleTextToSpeech}
            className="mt-4 w-full bg-green-600 text-white p-2 rounded-lg hover:bg-green-700"
            disabled={ttsLoading || !translatedText}
          >
            {ttsLoading ? "Generating..." : "Generate Audio "}
          </button>
      {audioUrl && <audio controls src={audioUrl} className="w-full mt-2 rounded-lg shadow-md" />}
        </div>
      </div>

      {/* ASR Section */}
      <div className="mt-6 w-full max-w-4xl bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-2">Speech Recognition (ASR)</h2>
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
          className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700"
        />
        <button
          onClick={handleASR}
          className="mt-4 w-full bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700"
          disabled={asrLoading || !audioFile}
        >
          {asrLoading ? "Processing..." : "Transcribe Audio"}
        </button>
      </div>
    </div>
  );
}

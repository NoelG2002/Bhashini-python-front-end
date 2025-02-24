"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Head from "next/head";

const ThemeToggle = () => {
  const [theme, setTheme] = useState("light");

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
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const languages = [
    { code: "en", label: "English" },
    { code: "hi", label: "Hindi" },
    { code: "ml", label: "Malayalam" },
    { code: "ta", label: "Tamil" },
    { code: "te", label: "Telugu" },
    { code: "ur", label: "Urdu" },
  ];

  const handleTranslate = async () => {
    setLoading(true);
    try {
      const response = await axios.post("https://bhashini-python-frd9.onrender.com/translate", {
        source_language: sourceLang,
        target_language: targetLang,
        text: text,
      });
      setTranslatedText(response.data.translated_text);
    } catch (error) {
      console.error("Translation error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTextToSpeech = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  const handleASR = async () => {
    setLoading(true);
    if (!audioFile) {
      console.error("No audio file selected");
      setLoading(false);
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
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <Head>
        <title>Bhashini - Translate</title>
      </Head>

      <h1 className="text-3xl font-bold mb-6">Bhashini Translator</h1>
      <ThemeToggle />

      <div className="w-full max-w-md space-y-4">
        <div className="flex space-x-2">
          <select value={sourceLang} onChange={(e) => setSourceLang(e.target.value)} className="w-1/2 p-2 rounded bg-white dark:bg-gray-700 border">
            {languages.map((lang) => <option key={lang.code} value={lang.code}>{lang.label}</option>)}
          </select>
          <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)} className="w-1/2 p-2 rounded bg-white dark:bg-gray-700 border">
            {languages.map((lang) => <option key={lang.code} value={lang.code}>{lang.label}</option>)}
          </select>
        </div>

        <textarea className="w-full p-2 border rounded bg-white dark:bg-gray-700" value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter text to translate" />

        <button onClick={handleTranslate} className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Translate</button>
        <button onClick={handleTextToSpeech} className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">Text-to-Speech</button>

        {audioUrl && <audio controls src={audioUrl} className="w-full" />}

        <input type="file" onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)} accept="audio/*" className="w-full border p-2 rounded" />
        <button onClick={handleASR} className="w-full bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600">Speech to Text</button>

        {loading && <p className="text-center">Loading...</p>}
        <h2 className="text-xl font-semibold mt-4">Translation:</h2>
        <p className="p-2 border bg-white dark:bg-gray-700 rounded">{translatedText}</p>
      </div>
    </div>
  );
}

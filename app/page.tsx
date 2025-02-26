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

    <h1 className="text-3xl font-bold mb-4 text-center">Bhashini Translator</h1>
    <ThemeToggle />

    <div className="w-full max-w-lg bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 space-y-4">
      <div className="flex space-x-2">
        <select value={sourceLang} onChange={(e) => setSourceLang(e.target.value)} 
          className="w-1/2 p-2 rounded border bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500">
          {languages.map((lang) => <option key={lang.code} value={lang.code}>{lang.label}</option>)}
        </select>
        <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)} 
          className="w-1/2 p-2 rounded border bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500">
          {languages.map((lang) => <option key={lang.code} value={lang.code}>{lang.label}</option>)}
        </select>
      </div>

      <textarea className="w-full p-3 border rounded bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500" 
        value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter text to translate" rows={3} />

      {/* Buttons in Horizontal Layout */}
      <div className="flex space-x-2">
        <button onClick={handleTranslate} className="w-1/3 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition">
          Translate
        </button>
        <button onClick={handleTextToSpeech} className="w-1/3 bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition">
          Text-to-Speech
        </button>
        <button onClick={handleASR} className="w-1/3 bg-yellow-500 text-white p-2 rounded-lg hover:bg-yellow-600 transition">
          Speech to Text
        </button>
      </div>

      {audioUrl && <audio controls src={audioUrl} className="w-full mt-2 rounded-lg shadow-md" />}

      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Upload an Audio File
        <input type="file" onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)} accept="audio/*"
          className="w-full border p-2 rounded bg-gray-50 dark:bg-gray-700 mt-1 focus:ring-2 focus:ring-blue-500" />
      </label>

      {loading && <p className="text-center text-blue-500">Processing...</p>}

      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Translation:</h2>
        <p className="mt-2 text-gray-900 dark:text-gray-200">{translatedText}</p>
      </div>
    </div>
  </div>
);

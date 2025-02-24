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
    <div className="absolute top-4 right-4">
      <button onClick={toggleTheme} className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded-md shadow-md hover:bg-gray-400 dark:hover:bg-gray-600">
        {theme === "light" ? "Dark Mode" : "Light Mode"}
      </button>
    </div>
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
      if (response.data.translated_text) setTranslatedText(response.data.translated_text);
      else console.error("Error: No translated text returned from ASR");
    } catch (error) {
      console.error("ASR error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto text-center">
      <Head>
        <title>Bhashini - Translate</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">Bhashini Translator</h1>
      <ThemeToggle />
      <div className="flex flex-col gap-4 mt-4">
        <select value={sourceLang} onChange={(e) => setSourceLang(e.target.value)} className="border p-2 rounded-md bg-white text-black dark:bg-gray-800 dark:text-white">
          {languages.map((lang) => <option key={lang.code} value={lang.code}>{lang.label}</option>)}
        </select>
        <textarea className="border p-2 rounded-md bg-white text-black dark:bg-gray-800 dark:text-white" value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter text to translate" />
        <button onClick={handleTranslate} className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600">Translate</button>
        <button onClick={handleTextToSpeech} className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600">Text-to-Speech</button>
        <input type="file" onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)} accept="audio/*" className="border p-2" />
        <button onClick={handleASR} className="bg-yellow-500 text-white p-2 rounded-md hover:bg-yellow-600">Speech to Text Translation</button>
        {loading && <p className="text-gray-500">Processing...</p>}
        <h2 className="text-xl font-semibold mt-4">Translation:</h2>
        <p className="border p-2 bg-white text-black dark:bg-gray-800 dark:text-white rounded-md">{translatedText}</p>
      </div>
    </div>
  );
}

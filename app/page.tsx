"use client";

import { useState } from "react";
import axios from "axios";
import Head from "next/head";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
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




export default function Home() {

  const [text, setText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState("hi");
  const [targetLang, setTargetLang] = useState("en");
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
      const response = await axios.post("https://bhashini-python.onrender.com/translate", {
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
    const response = await axios.post("https://bhashini-python.onrender.com/tts", {
      source_language: sourceLang,
      target_language: targetLang,
      text: text,
    });

    const audioBase64 = response.data.audio_base64;
    const audioBlob = new Blob([
      new Uint8Array(atob(audioBase64).split("").map((char) => char.charCodeAt(0))),
    ], { type: "audio/wav" });

    const newAudioUrl = URL.createObjectURL(audioBlob);
    setAudioUrl(newAudioUrl); // Store the URL

    const audio = new Audio(newAudioUrl);
    audio.play();
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
    formData.append("audio_file", audioFile); // Append the audio file directly
    formData.append("source_language", sourceLang); // Append source language
    formData.append("target_language", targetLang); // Append target language

    const response = await axios.post("https://bhashini-python.onrender.com/asr_nmt", formData, {
      headers: {
        "Content-Type": "multipart/form-data", // Ensure the content type is multipart/form-data
      },
    });

    if (response.data.translated_text) {
      setTranslatedText(response.data.translated_text); // Set the translated text
    } else {
      console.error("Error: No translated text returned from ASR");
    }
  } catch (error) {
    console.error("ASR error:", error);
  } finally {
    setLoading(false);
  }
};




  return (
    <div className="p-6 max-w-lg mx-auto">
         
        <Head>
        <title>Bhashini - Translate</title>
        </Head>
        
      <h1 className="text-2xl font-bold mb-4">Bhashini Translator</h1>
      <button
      onClick={toggleTheme}
      className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded-md"
    >
      {theme === "light" ? "Dark Mode" : "Light Mode"}
    </button>
      <div className="flex flex-col gap-2">
        <select value={sourceLang} onChange={(e) => setSourceLang(e.target.value)} className="border p-2">
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>{lang.label}</option>
          ))}
        </select>

        <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)} className="border p-2">
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>{lang.label}</option>
          ))}
        </select>

        <textarea
          className="border p-2"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to translate"
        />

        <button onClick={handleTranslate} className="bg-blue-500 text-white p-2 rounded">
          Translate
        </button>

        <button onClick={handleTextToSpeech} className="bg-green-500 text-white p-2 rounded">
          Text-to-Speech
        </button>

        
        {audioUrl && (
  <a href={audioUrl} download="output_audio.wav" className="bg-purple-500 text-white p-2 rounded p-2 mt-2">
    Download Audio
  </a>
)}


       <input
          type="file"
          onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
          accept="audio/*"
          className="border p-2"
        />

        
        <button onClick={handleASR} className="bg-yellow-500 text-white p-2 rounded">
         Speech to Text Translation 
        </button>

        {loading && <p>Loading...</p>}

        <h2 className="text-xl font-semibold mt-4">Translation:</h2>
        <p className="border p-2">{translatedText}</p>
      </div>
    </div>
  );
}

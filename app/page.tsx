"use client";

import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [text, setText] = useState<string>("");
  const [translatedText, setTranslatedText] = useState<string>("");
  const [sourceLang, setSourceLang] = useState<string>("hi");
  const [targetLang, setTargetLang] = useState<string>("en");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Mapping of language codes to full language names
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
    { code: "ur", label: "Urdu " },
  ];

  // Function to handle text translation
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

  // Function to handle text-to-speech (TTS)
  const handleTextToSpeech = async () => {
    setLoading(true);
    try {
      const response = await axios.post("https://bhashini-python.onrender.com/tts", {
        source_language: sourceLang,
        text: text,
      });
      const audioBase64 = response.data.base64_string;
      const audioBlob = new Blob([new Uint8Array(atob(audioBase64).split("").map(char => char.charCodeAt(0)))], { type: "audio/mp3" });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error) {
      console.error("TTS error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle ASR (Automatic Speech Recognition)
  const handleASR = async () => {
    setLoading(true);
    if (!audioFile) {
      console.error("No audio file selected");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", audioFile);
    formData.append("source_language", sourceLang);
    formData.append("target_language", targetLang);

    try {
      const response = await axios.post("https://bhashini-python.onrender.com/asr_nmt", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setTranslatedText(response.data.translated_text);
    } catch (error) {
      console.error("ASR error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Bhashini Translator</h1>
      <div className="flex flex-col gap-2">
        {/* Source language select */}
        <select value={sourceLang} onChange={(e) => setSourceLang(e.target.value)} className="border p-2">
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label} {/* Display full language name */}
            </option>
          ))}
        </select>

        {/* Target language select */}
        <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)} className="border p-2">
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label} {/* Display full language name */}
            </option>
          ))}
        </select>

        {/* Text area for user input */}
        <textarea
          className="border p-2"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to translate"
        />

        {/* Button to trigger translation */}
        <button onClick={handleTranslate} className="bg-blue-500 text-white p-2 rounded">
          Translate
        </button>

        {/* Button to trigger text-to-speech */}
        <button onClick={handleTextToSpeech} className="bg-green-500 text-white p-2 rounded">
          Text-to-Speech
        </button>

        {/* Input for audio file */}
        <input
          type="file"
          onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
          accept="audio/*"
          className="border p-2"
        />
        {/* Button to trigger ASR */}
        <button onClick={handleASR} className="bg-yellow-500 text-white p-2 rounded">
          Automatic Speech Recognition
        </button>

        {/* Loading state */}
        {loading && <p>Loading...</p>}

        {/* Display translated text */}
        <h2 className="text-xl font-semibold mt-4">Translation:</h2>
        <p className="border p-2">{translatedText}</p>
      </div>
    </div>
  );
}

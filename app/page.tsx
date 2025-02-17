"use client";

import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [text, setText] = useState<string>("");
  const [translatedText, setTranslatedText] = useState<string>("");
  const [sourceLang, setSourceLang] = useState<string>("hin_Deva");
  const [targetLang, setTargetLang] = useState<string>("eng_Latn");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const languages = [
    { code: "asm_Beng", label: "Assamese" },
    { code: "ben_Beng", label: "Bengali" },
    { code: "brx_Deva", label: "Bodo" },
    { code: "doi_Deva", label: "Dogri" },
    { code: "eng_Latn", label: "English" },
    { code: "gom_Deva", label: "Konkani" },
    { code: "hin_Deva", label: "Hindi" },
    { code: "kas_Arab", label: "Kashmiri (Arabic)" },
    { code: "kas_Deva", label: "Kashmiri (Devanagari)" },
    { code: "mai_Deva", label: "Maithili" },
    { code: "mal_Mlym", label: "Malayalam" },
    { code: "mar_Deva", label: "Marathi" },
    { code: "mni_Beng", label: "Manipuri (Bengali)" },
    { code: "mni_Mtei", label: "Manipuri (Meitei)" },
    { code: "npi_Deva", label: "Nepali" },
    { code: "ory_Orya", label: "Odia" },
    { code: "pan_Guru", label: "Punjabi (Gurmukhi)" },
    { code: "san_Deva", label: "Sanskrit" },
    { code: "sat_Olck", label: "Santali" },
    { code: "snd_Arab", label: "Sindhi (Arabic)" },
    { code: "snd_Deva", label: "Sindhi (Devanagari)" },
    { code: "tam_Taml", label: "Tamil" },
    { code: "tel_Telu", label: "Telugu" },
    { code: "urd_Arab", label: "Urdu (Arabic)" },
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
      const response = await axios.post("https://bhashini-python.onrender.com/asr", formData, {
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
        <select value={sourceLang} onChange={(e) => setSourceLang(e.target.value)} className="border p-2">
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>

        <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)} className="border p-2">
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
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

        <input
          type="file"
          onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
          accept="audio/*"
          className="border p-2"
        />
        <button onClick={handleASR} className="bg-yellow-500 text-white p-2 rounded">
          Automatic Speech Recognition
        </button>

        {loading && <p>Loading...</p>}

        <h2 className="text-xl font-semibold mt-4">Translation:</h2>
        <p className="border p-2">{translatedText}</p>
      </div>
    </div>
  );
}

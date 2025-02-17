"use client";

import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [text, setText] = useState<string>("");
  const [translatedText, setTranslatedText] = useState<string>("");
  const [sourceLang, setSourceLang] = useState<string>("hin_Deva");
  const [targetLang, setTargetLang] = useState<string>("eng_Latn");

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
    try {
      const response = await axios.post("https://bhashini-python.onrender.com/translate", {
        source_language: sourceLang,
        target_language: targetLang,
        text: text,
      });
      setTranslatedText(response.data.translated_text);
    } catch (error) {
      console.error("Translation error:", error);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Bhashini Translator</h1>
      <div className="flex flex-col gap-2">
        {/* Source Language Dropdown */}
        <select value={sourceLang} onChange={(e) => setSourceLang(e.target.value)} className="border p-2">
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>

        {/* Target Language Dropdown */}
        <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)} className="border p-2">
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>

        {/* Input Text */}
        <textarea
          className="border p-2"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to translate"
        />

        {/* Translate Button */}
        <button onClick={handleTranslate} className="bg-blue-500 text-white p-2 rounded">Translate</button>

        {/* Translated Text */}
        <h2 className="text-xl font-semibold mt-4">Translation:</h2>
        <p className="border p-2">{translatedText}</p>
      </div>
    </div>
  );
}

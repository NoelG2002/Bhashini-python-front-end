"use client";

import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [text, setText] = useState<string>("");
  const [translatedText, setTranslatedText] = useState<string>("");
  const [sourceLang, setSourceLang] = useState<string>("hin_Deva");
  const [targetLang, setTargetLang] = useState<string>("eng_Latn");

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
        <select value={sourceLang} onChange={(e) => setSourceLang(e.target.value)} className="border p-2">
          <option value="hin_Deva">Hindi</option>
          <option value="ben_Beng">Bengali</option>
          <option value="tam_Taml">Tamil</option>
        </select>

        <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)} className="border p-2">
          <option value="eng_Latn">English</option>
          <option value="mar_Deva">Marathi</option>
        </select>

        <textarea
          className="border p-2"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to translate"
        />

        <button onClick={handleTranslate} className="bg-blue-500 text-white p-2 rounded">Translate</button>
        
        <h2 className="text-xl font-semibold mt-4">Translation:</h2>
        <p className="border p-2">{translatedText}</p>
      </div>
    </div>
  );
}

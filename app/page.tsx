"use client";

import { useState } from "react";
import axios from "axios";

const languageOptions = [
  "Assamese", "Bengali", "Bodo", "Dogri", "English", "Gujarati", "Hindi", "Kannada",
  "Kashmiri (Arabic)", "Kashmiri (Devanagari)", "Konkani", "Malayalam", "Marathi", "Maithili",
  "Manipuri (Bengali)", "Manipuri (Meitei)", "Nepali", "Odia", "Punjabi", "Sanskrit", "Santali",
  "Sindhi (Arabic)", "Sindhi (Devanagari)", "Tamil", "Telugu", "Urdu"
];

const Home = () => {
  const [text, setText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("English");
  const [targetLanguage, setTargetLanguage] = useState("Hindi");
  const [translatedText, setTranslatedText] = useState("");
  const [audio, setAudio] = useState("");

  const handleTranslation = async () => {
    try {
      const response = await axios.post("http://localhost:8000/translate", {
        text,
        source_language: sourceLanguage,
        target_language: targetLanguage,
      });
      setTranslatedText(response.data.translated_text);
    } catch (error) {
      console.error("Error during translation:", error);
    }
  };

  const handleTextToSpeech = async () => {
    try {
      const response = await axios.post("http://localhost:8000/tts", {
        text,
        source_language: sourceLanguage,
        target_language: targetLanguage,
      });
      setAudio(response.data.audio_base64);
    } catch (error) {
      console.error("Error during TTS:", error);
    }
  };

  return (
    <div>
      <h1>Language Translation</h1>
      <textarea
        placeholder="Enter text to translate"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <br />
      <label>Source Language: </label>
      <select
        value={sourceLanguage}
        onChange={(e) => setSourceLanguage(e.target.value)}
      >
        {languageOptions.map((lang) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>
      <br />
      <label>Target Language: </label>
      <select
        value={targetLanguage}
        onChange={(e) => setTargetLanguage(e.target.value)}
      >
        {languageOptions.map((lang) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>
      <br />
      <button onClick={handleTranslation}>Translate</button>
      <br />
      <button onClick={handleTextToSpeech}>Text to Speech</button>
      <br />
      {translatedText && (
        <div>
          <h2>Translated Text:</h2>
          <p>{translatedText}</p>
        </div>
      )}
      {audio && (
        <div>
          <h2>Text to Speech (Audio):</h2>
          <audio controls>
            <source src={`data:audio/mp3;base64,${audio}`} type="audio/mp3" />
          </audio>
        </div>
      )}
    </div>
  );
};

export default Home;

"use client";

import { useState } from "react";
import axios from "axios";

const languageCodeMapping = {
  Assamese: "asm_Beng",
  Bengali: "ben_Beng",
  Bodo: "brx_Deva",
  Dogri: "doi_Deva",
  English: "eng_Latn",
  Gujarati: "guj_Gujr",
  Hindi: "hin_Deva",
  Kannada: "kan_Knda",
  "Kashmiri (Arabic)": "kas_Arab",
  "Kashmiri (Devanagari)": "kas_Deva",
  Konkani: "gom_Deva",
  Malayalam: "mal_Mlym",
  Marathi: "mar_Deva",
  Maithili: "mai_Deva",
  "Manipuri (Bengali)": "mni_Beng",
  "Manipuri (Meitei)": "mni_Mtei",
  Nepali: "npi_Deva",
  Odia: "ory_Orya",
  Punjabi: "pan_Guru",
  Sanskrit: "san_Deva",
  Santali: "sat_Olck",
  "Sindhi (Arabic)": "snd_Arab",
  "Sindhi (Devanagari)": "snd_Deva",
  Tamil: "tam_Taml",
  Telugu: "tel_Telu",
  Urdu: "urd_Arab",
};

const Home = () => {
  const [sourceLanguage, setSourceLanguage] = useState("English");
  const [targetLanguage, setTargetLanguage] = useState("Hindi");
  const [recognizedText, setRecognizedText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [audio, setAudio] = useState("");

  const handleASR = async (event) => {
    const formData = new FormData();
    formData.append("file", event.target.files[0]);

    // Map the selected languages to their corresponding codes
    const sourceLangCode = languageCodeMapping[sourceLanguage];
    const targetLangCode = languageCodeMapping[targetLanguage];

    // Append the source and target language codes
    formData.append("source_language", sourceLangCode);
    formData.append("target_language", targetLangCode);

    try {
      const response = await axios.post("http://localhost:8000/asr_nmt", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Update the state with recognized and translated text
      setRecognizedText(response.data.recognized_text);
      setTranslatedText(response.data.translated_text);
    } catch (error) {
      console.error("Error during ASR:", error);
    }
  };

  return (
    <div>
      <h1>Automatic Speech Recognition and Translation</h1>
      
      <label>Source Language: </label>
      <select
        value={sourceLanguage}
        onChange={(e) => setSourceLanguage(e.target.value)}
      >
        {Object.keys(languageCodeMapping).map((lang) => (
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
        {Object.keys(languageCodeMapping).map((lang) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>
      <br />
      
      <input type="file" accept="audio/*" onChange={handleASR} />
      <br />
      
      {recognizedText && (
        <div>
          <h2>Recognized Text:</h2>
          <p>{recognizedText}</p>
        </div>
      )}
      
      {translatedText && (
        <div>
          <h2>Translated Text:</h2>
          <p>{translatedText}</p>
        </div>
      )}
    </div>
  );
};

export default Home;

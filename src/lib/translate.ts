/**
 * Translation utility using a free translation API (MyMemory)
 */

export async function translateText(text: string, targetLanguage: string): Promise<string> {
  if (!text || !targetLanguage) return text;

  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|${targetLanguage}`
    );
    const data = await response.json();

    if (data.responseStatus === 200) {
      return data.responseData.translatedText;
    } else {
      console.error('Translation error:', data.responseDetails);
      return text;
    }
  } catch (error) {
    console.error('Translation fetch failed:', error);
    return text;
  }
}

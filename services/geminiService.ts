import { GoogleGenAI } from "@google/genai";
import { GitHubIssue, GitHubComment } from "../types";

// Initialize Gemini
// Note: In a real environment, you might want to instantiate this only when needed 
// or ensure the key is present. The system instruction guarantees process.env.API_KEY is available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const summarizeDiscussion = async (issue: GitHubIssue, comments: GitHubComment[]): Promise<string> => {
  const model = 'gemini-2.5-flash';
  
  const commentsText = comments.map(c => `- ${c.user.login}: ${c.body.substring(0, 300)}...`).join('\n');
  const prompt = `
    Analiza la siguiente discusión de un Issue de GitHub y genera un resumen conciso y útil en español.
    
    Título del Post: ${issue.title}
    Autor Original: ${issue.user.login}
    Contenido Original: ${issue.body.substring(0, 1000)}...

    Comentarios destacados:
    ${commentsText}

    Instrucciones:
    1. Resume el problema o tema principal planteado en el post.
    2. Resume el sentimiento general de los comentarios y las soluciones propuestas si las hay.
    3. Usa un tono informativo y neutral, como un resumen ejecutivo.
    4. Máximo 150 palabras.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    
    return response.text || "No se pudo generar el resumen.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Hubo un error al intentar resumir la discusión con IA.";
  }
};

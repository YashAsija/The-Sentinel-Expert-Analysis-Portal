import { useState, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";

export interface ReportSection {
  title: string;
  content: string;
}

export interface AnalysisResult {
  brief: {
    observedTrends: string;
    regulatoryContext: string;
    literatureBenchmarks: string;
  };
  detailed: {
    observedTrends: string;
    regulatoryContext: string;
    literatureBenchmarks: string;
  };
  legalDocument: string;
  shortSummary: string;
  citations: {
    fact: string;
    source: string;
  }[];
  neutralityAudit: {
    original: string;
    neutralized: string;
    reason: string;
  }[];
  neutralityFlags: {
    sentence: string;
    issue: string;
    suggestion: string;
  }[];
}

const SYSTEM_INSTRUCTION = `
You are "The Sentinel", a high-end analysis engine for legal and medical professionals.
Your task is to transform raw, unstructured sensitive data into a structured, neutral report.

STRICT RULES:
1. DESCRIPTIVE, NOT PRESCRIPTIVE: Never tell the user what to do. Use neutral language.
2. CATEGORIZATION: Output exactly three sections: "Observed Trends", "Regulatory Context", and "Literature Benchmarks".
3. DUAL FORMAT: Provide both a "brief" (concise summary of main details) and a "detailed" (very explained report highlighting main points) version for each section.
4. LEGAL DOCUMENT: Generate a "legalDocument" version of the entire analysis, formatted as a formal legal memorandum or affidavit.
5. SHORT SUMMARY: Provide a "shortSummary" (2-3 sentences) of the entire analysis.
6. CITATIONS: For each significant piece of summarized data, attempt to identify and include a source.
7. NEUTRALITY VALIDATION: 
   - Identify any prescriptive verbs (should, must, recommend, advise) or phrases in the raw text and explain how you neutralized them.
   - Perform a post-generation check on your own output.

Output format must be JSON matching the AnalysisResult interface.
`;

export const useReportGenerator = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateReport = useCallback(async (rawText: string) => {
    if (!rawText.trim()) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: rawText,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              brief: {
                type: Type.OBJECT,
                properties: {
                  observedTrends: { type: Type.STRING },
                  regulatoryContext: { type: Type.STRING },
                  literatureBenchmarks: { type: Type.STRING }
                },
                required: ["observedTrends", "regulatoryContext", "literatureBenchmarks"]
              },
              detailed: {
                type: Type.OBJECT,
                properties: {
                  observedTrends: { type: Type.STRING },
                  regulatoryContext: { type: Type.STRING },
                  literatureBenchmarks: { type: Type.STRING }
                },
                required: ["observedTrends", "regulatoryContext", "literatureBenchmarks"]
              },
              legalDocument: { type: Type.STRING },
              shortSummary: { type: Type.STRING },
              citations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    fact: { type: Type.STRING },
                    source: { type: Type.STRING }
                  },
                  required: ["fact", "source"]
                }
              },
              neutralityAudit: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    original: { type: Type.STRING },
                    neutralized: { type: Type.STRING },
                    reason: { type: Type.STRING }
                  },
                  required: ["original", "neutralized", "reason"]
                }
              },
              neutralityFlags: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    sentence: { type: Type.STRING },
                    issue: { type: Type.STRING },
                    suggestion: { type: Type.STRING }
                  },
                  required: ["sentence", "issue", "suggestion"]
                }
              }
            },
            required: ["brief", "detailed", "legalDocument", "shortSummary", "citations", "neutralityAudit", "neutralityFlags"]
          }
        }
      });

      const data = JSON.parse(response.text || "{}");
      setResult(data);
    } catch (err) {
      console.error("Analysis failed:", err);
      setError("Failed to process data. Please ensure the input is valid.");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const resetResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { generateReport, isProcessing, result, error, resetResult };
};

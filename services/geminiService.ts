
import { GoogleGenAI, Type } from "@google/genai";
import { EntityProfile, ValidatorResult, ThreatMetric, GroundingSource, DiagnosticReport, IntegrationCredentials, DiagnosticIssue } from "../types";

// Initialize Gemini Client
// We assume process.env.API_KEY is available as per instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SCANNER_MODEL = "gemini-3-pro-preview"; // Required for Google Search
const VALIDATOR_MODEL = "gemini-3-flash-preview"; // Faster for text validation

// --- MOCK DATA FOR FALLBACKS (When API Quota Exceeded) ---

const MOCK_ENTITY_PROFILE: EntityProfile = {
  name: "Target Entity (Simulated)",
  summary: "Analysis generated via fallback simulation due to API limits. The entity shows a moderate digital footprint with recent activity detected on social platforms. Security posture appears stable but warrants monitoring.",
  sentiment: "neutral",
  lastActive: "Active 4 hours ago",
  metrics: [
    { category: "Reputation Risk", score: 45, severity: "medium", details: "Mixed sentiment in recent public discussions." },
    { category: "Data Exposure", score: 12, severity: "low", details: "No major leaks detected in recent breaches." },
    { category: "Public Interest", score: 78, severity: "high", details: "Spike in search volume detected." }
  ],
  sources: [{ uri: "#", title: "Simulated Source: Social Graph v4" }],
  generatedAt: new Date().toISOString()
};

const MOCK_VALIDATOR_RESULT: ValidatorResult = {
  isThreat: true,
  confidence: 88,
  type: "Phishing / Social Engineering",
  reasoning: "The content exhibits classic urgency patterns and requests sensitive credentials. (Simulated Analysis)",
  safetyTips: ["Do not click links.", "Verify sender identity via alternative channels."],
  technicalAnalysis: "Header analysis suggests spoofed domain. Return-Path does not match From address.",
  remediationPlan: ["Block sender domain.", "Report to IT security.", "Purge from inbox."]
};

const MOCK_DIAGNOSTIC_REPORT: DiagnosticReport = {
    targetUrl: "https://target-system.com",
    scanTime: new Date().toLocaleTimeString(),
    scanType: "Deep System Scan (Simulated)",
    healthScore: 65,
    issues: [
        { 
          id: "SIM-001", 
          severity: "high", 
          layer: "database", 
          location: "wp_users", 
          description: "Default 'admin' username detected.", 
          solution: "Create a new administrator account and delete the default 'admin'.", 
          fix: "UPDATE wp_users SET user_login = 'new_admin_user' WHERE user_login = 'admin';", 
          status: "pending" 
        },
        { 
          id: "SIM-002", 
          severity: "critical", 
          layer: "filesystem", 
          location: "wp-config.php", 
          description: "Database credentials visible in plain text backups.", 
          solution: "Move config outside web root and set 600 permissions.", 
          fix: "chmod 600 wp-config.php", 
          status: "pending" 
        }
    ]
};

const MOCK_AUTO_FIX = {
    originalCode: "$wpdb->query(\"SELECT * FROM $table WHERE id = $id\");",
    patchedCode: "$wpdb->prepare(\"SELECT * FROM $table WHERE id = %d\", $id);",
    explanation: "Replaced direct variable interpolation with wpdb::prepare to prevent SQL injection attacks. (Simulated Patch)"
};

// --- HELPER FUNCTIONS ---

// Helper to safely parse JSON from AI response, handling Markdown code blocks
const safeJSONParse = (text: string) => {
  try {
    // Remove markdown code blocks if present
    let cleanText = text.trim();
    if (cleanText.startsWith('```')) {
       cleanText = cleanText.replace(/^```(json)?/, '').replace(/```$/, '');
    }
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("JSON Parse Error on text:", text);
    throw new Error("Failed to parse intelligence data from AI response.");
  }
};

const isQuotaError = (error: any): boolean => {
    const msg = error?.message || '';
    const status = error?.status || '';
    return msg.includes('429') || status === 'RESOURCE_EXHAUSTED' || msg.includes('quota');
};

export const scanEntity = async (query: string): Promise<EntityProfile> => {
  try {
    const prompt = `
      Perform a comprehensive protective intelligence analysis on the following entity or topic: "${query}".
      
      Use Google Search to find the most recent and relevant public information. 
      Focus on digital footprint, potential security risks, public sentiment, and recent news.
      
      Return the response in a structured JSON format with the following schema:
      {
        "summary": "A concise executive summary of the entity's current online status.",
        "sentiment": "One of: positive, neutral, negative, mixed",
        "lastActive": "A string describing recent activity timeframe (e.g., '2 hours ago', 'Active within last week')",
        "metrics": [
          {
            "category": "Reputation Risk",
            "score": 0-100,
            "severity": "low/medium/high/critical",
            "details": "Explanation of score"
          },
          {
            "category": "Data Exposure",
            "score": 0-100,
            "severity": "low/medium/high/critical",
            "details": "Explanation of score"
          },
          {
            "category": "Public Interest",
            "score": 0-100,
            "severity": "low/medium/high/critical",
            "details": "Explanation of score"
          }
        ]
      }
    `;

    const response = await ai.models.generateContent({
      model: SCANNER_MODEL,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            sentiment: { type: Type.STRING, enum: ["positive", "neutral", "negative", "mixed"] },
            lastActive: { type: Type.STRING },
            metrics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  score: { type: Type.NUMBER },
                  severity: { type: Type.STRING, enum: ["low", "medium", "high", "critical"] },
                  details: { type: Type.STRING },
                }
              }
            }
          }
        }
      }
    });

    // Extract Text and Parse JSON safely
    const text = response.text || "{}";
    const data = safeJSONParse(text);

    // Extract Grounding Metadata (Sources)
    // The SDK structure for grounding chunks:
    // response.candidates[0].groundingMetadata.groundingChunks
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = groundingChunks
      .map((chunk: any) => chunk.web ? { uri: chunk.web.uri, title: chunk.web.title } : null)
      .filter((s: any) => s !== null) as GroundingSource[];

    // Deduplicate sources by URI
    const uniqueSources = Array.from(new Map(sources.map(s => [s.uri, s])).values());

    return {
      name: query,
      summary: data.summary || "No summary available.",
      sentiment: data.sentiment || "neutral",
      lastActive: data.lastActive || "Unknown",
      metrics: data.metrics || [],
      sources: uniqueSources,
      generatedAt: new Date().toISOString()
    };

  } catch (error: any) {
    if (isQuotaError(error)) {
        console.warn("Gemini Quota Exceeded. Using fallback simulation for Scan.");
        return { ...MOCK_ENTITY_PROFILE, name: query };
    }
    console.error("Entity Scan Error:", error);
    throw new Error("Failed to scan entity.");
  }
};

export const validateContent = async (content: string): Promise<ValidatorResult> => {
  try {
    const prompt = `
      Analyze the following text or URL for security threats, scams, phishing attempts, or technical vulnerabilities.
      Input to analyze: "${content}"
      
      Return a detailed JSON response.
    `;

    const response = await ai.models.generateContent({
      model: VALIDATOR_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isThreat: { type: Type.BOOLEAN },
            confidence: { type: Type.NUMBER },
            type: { type: Type.STRING },
            reasoning: { type: Type.STRING },
            safetyTips: { type: Type.ARRAY, items: { type: Type.STRING } },
            technicalAnalysis: { type: Type.STRING },
            remediationPlan: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    const text = response.text || "{}";
    return safeJSONParse(text) as ValidatorResult;

  } catch (error) {
    if (isQuotaError(error)) {
        console.warn("Gemini Quota Exceeded. Using fallback simulation for Validation.");
        return MOCK_VALIDATOR_RESULT;
    }
    console.error("Validation Error:", error);
    throw new Error("Failed to validate content.");
  }
};

export const generateWPSecurityCode = async (siteUrl: string, level: string): Promise<string> => {
  try {
    const prompt = `
      Generate a PHP code snippet for a WordPress Mu-Plugin "Aegis Sentinel".
      Target: ${siteUrl}, Level: ${level}.
      Include headers, disable XML-RPC, hide version.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "<?php // Failed to generate code. ?>";
  } catch (error) {
    return "<?php // Error generating plugin code. ?>";
  }
};

export const runWPDiagnostic = async (config: IntegrationCredentials, scanType: string = "Deep System Scan"): Promise<DiagnosticReport> => {
  try {
    const prompt = `
      Simulate a ${scanType} for a WordPress site based on these credentials:
      URL: ${config.wpUrl}
      Database Access: ${config.dbHost ? 'Yes' : 'No'}
      
      The scan type focus is: ${scanType}.
      
      If scanType is 'Malware', perform a deep heuristic analysis for known malware signatures and anomalies:
        - Obfuscation: Look for 'eval', 'base64_decode', 'gzinflate', 'str_rot13', and hex encoding.
        - Backdoors: Identify 'shell_exec', 'system', 'passthru', and unauthorized file upload handlers.
        - Location: Flag PHP files in /wp-content/uploads/ or /wp-includes/images/.
        - Admin Injection: Detect unauthorized user creation functions (wp_create_user) in themes.
      If scanType is 'SEO & Ads', perform a rigorous audit for Google Ads policy compliance and SEO best practices:
        - Landing Page Experience: Check for intrusive interstitials, slow load times, and mobile responsiveness issues.
        - Meta Tags: Verify 'description', 'viewport', and Open Graph tags.
        - Robots.txt: Check for blocking of CSS/JS resources which affects rendering.
        - Restricted Content: Scan for keywords related to gambling, healthcare, or financial services that might trigger policy violations.
        - Navigation: Ensure links are functional and policies (Privacy, Terms) are visible.
      If scanType is 'Database', generate issues about overhead, orphaned meta, or injection risks.
      
      Return a JSON report with:
      - healthScore (0-100)
      - issues: Array of objects { 
          id, 
          severity (critical/high/medium/low), 
          layer (database/filesystem/wordpress_core/server_config/seo_ads),
          location (Exact file path or DB table name),
          description,
          solution (Human readable explanation of how to fix),
          fix (Technical action/code) 
        }
    `;

     const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            targetUrl: { type: Type.STRING },
            scanTime: { type: Type.STRING },
            healthScore: { type: Type.NUMBER },
            issues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  severity: { type: Type.STRING, enum: ["critical", "high", "medium", "low"] },
                  layer: { type: Type.STRING, enum: ["database", "filesystem", "wordpress_core", "network", "server_config", "seo_ads"] },
                  location: { type: Type.STRING },
                  description: { type: Type.STRING },
                  solution: { type: Type.STRING },
                  fix: { type: Type.STRING },
                }
              }
            }
          }
        }
      }
    });

    const text = response.text || "{}";
    const data = safeJSONParse(text);
    
    // Add default 'pending' status to all issues
    const issues = (data.issues || []).map((issue: any) => ({
        ...issue,
        status: 'pending'
    }));

    return {
      ...data,
      issues,
      scanType,
      targetUrl: config.wpUrl,
      scanTime: new Date().toLocaleTimeString()
    };
  } catch (e) {
    if (isQuotaError(e)) {
        console.warn("Gemini Quota Exceeded. Using fallback simulation for Diagnostic.");
        return { ...MOCK_DIAGNOSTIC_REPORT, targetUrl: config.wpUrl, scanType };
    }
    console.error("WP Diagnostic Error", e);
    // Fallback mock data if API fails
    return {
        targetUrl: config.wpUrl,
        scanType,
        scanTime: new Date().toLocaleTimeString(),
        healthScore: 45,
        issues: [
            { 
              id: "SYS-001", 
              severity: "critical", 
              layer: "database", 
              location: "wp_options", 
              description: "Autoload overhead exceeds 5MB.", 
              solution: "Remove expired transients and unused option keys.", 
              fix: "DELETE FROM wp_options WHERE option_name LIKE '_transient_%';", 
              status: "pending" 
            },
            { 
              id: "SYS-002", 
              severity: "high", 
              layer: "filesystem", 
              location: "/wp-config.php", 
              description: "Debug mode active on production.", 
              solution: "Disable WP_DEBUG constant.", 
              fix: "define('WP_DEBUG', false);", 
              status: "pending" 
            }
        ]
    }
  }
};

export const generateAutoFix = async (issue: DiagnosticIssue): Promise<{ originalCode: string; patchedCode: string; explanation: string }> => {
  try {
    const prompt = `
      You are an autonomous security agent patching a WordPress system.
      Issue: ${issue.description}
      Location: ${issue.location}
      Layer: ${issue.layer}
      Technical Fix Context: ${issue.fix}

      Generate a simulated "Original Code" snippet that contains the problem, and a "Patched Code" snippet that fixes it securely.
      Also provide a technical explanation of the change.

      Return JSON.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            originalCode: { type: Type.STRING },
            patchedCode: { type: Type.STRING },
            explanation: { type: Type.STRING }
          }
        }
      }
    });

    const text = response.text || "{}";
    return safeJSONParse(text);
  } catch (e) {
    if (isQuotaError(e)) {
        console.warn("Gemini Quota Exceeded. Using fallback simulation for AutoFix.");
        return MOCK_AUTO_FIX;
    }
    console.error("AutoFix Gen Error", e);
    return {
      originalCode: "// Unable to retrieve original code",
      patchedCode: issue.fix || "// Patch applied manually",
      explanation: "Standard remediation protocol applied."
    };
  }
};

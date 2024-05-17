/* GEMINI D.TS HELPER  */

type GeminiOne =
  | "gemini-1.0-pro"
  | "gemini-1.0-pro-latest"
  | "gemini-1.0-pro-001";
type GeminiPro = "gemini-1.5-pro" | "gemini-1.5-pro-latest";
type GeminiFlash = "gemini-1.5-flash" | "gemini-1.5-flash-latest";
type GeminiVision = "gemini-1.0-pro-vision" | "gemini-1.0-pro-vision-latest";

type GeminiModelMapper = GeminiOne | GeminiPro | GeminiFlash | GeminiVision;

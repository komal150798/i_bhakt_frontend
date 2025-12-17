export type ManifestRequest = {
  user_id: string;
  title: string;
  description?: string;
  category?: string;
  target_date: string;
};

export type Ritual = {
  name: string;
  frequency: string;
  how_to: string;
  reason: string;
};

export type ManifestResponse = {
  what_to_manifest: string[];
  what_not_to_manifest: string[];
  karmic_theme: string;
  thought_alignment: string[];
  rituals: Ritual[];
  confidence_score: number;
  reasoning: string[];
  seed?: any;
};

async function handleJsonResponse(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON response");
  }
}

export async function evaluateManifestation(payload: ManifestRequest): Promise<ManifestResponse> {
  const res = await fetch("/api/manifestation/evaluate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include"
  });

  if (!res.ok) {
    const body = await handleJsonResponse(res);
    const errorMsg = body?.detail || body?.message || "Server error";
    throw new Error(errorMsg);
  }

  const json = await handleJsonResponse(res);

  if (!json.what_to_manifest || !Array.isArray(json.what_to_manifest)) {
    throw new Error("Malformed response from server");
  }

  return json as ManifestResponse;
}

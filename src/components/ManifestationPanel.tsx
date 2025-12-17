import React, { useState } from "react";
import { evaluateManifestation, ManifestRequest, ManifestResponse } from "../services/manifestationService";

function getUserId(): string {
  return "user-123";
}

export default function ManifestationPanel() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("career");
  const [targetDate, setTargetDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ManifestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submitManifestation() {
    setError(null);
    setResult(null);
    setLoading(true);

    const payload: ManifestRequest = {
      user_id: getUserId(),
      title,
      description,
      category,
      target_date: targetDate
    };

    try {
      const out = await evaluateManifestation(payload);
      setResult(out);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-3">New Manifestation</h2>

        <div className="space-y-3">
          <input
            className="w-full border rounded p-2"
            placeholder="Title (e.g., Scale KhetiQuest tech centers)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            className="w-full border rounded p-2 min-h-[80px]"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex gap-3 items-center">
            <select
              className="border rounded p-2"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="career">Career</option>
              <option value="finance">Finance</option>
              <option value="family">Family</option>
              <option value="relationships">Relationships</option>
              <option value="custom">Custom</option>
            </select>

            <input
              className="border rounded p-2"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />

            <button
              onClick={submitManifestation}
              disabled={loading || !title}
              className="ml-auto bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-60"
            >
              {loading ? "Thinking..." : "Evaluate"}
            </button>
          </div>

          {error && <div className="text-red-600">{error}</div>}
        </div>
      </div>

      {result && (
        <div className="mt-6 space-y-4">
          <div className="bg-white shadow rounded-lg p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Manifestation Guidance</h3>
              <div className="text-sm text-gray-500">
                Confidence: {result.confidence_score}/100
              </div>
            </div>

            <div className="mt-3 text-sm text-gray-700">{result.karmic_theme}</div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="p-3 border rounded">
                <h4 className="font-medium mb-2">What to Manifest</h4>
                <ol className="list-decimal list-inside space-y-1">
                  {result.what_to_manifest.map((it, i) => (
                    <li key={i}>{it}</li>
                  ))}
                </ol>
              </div>

              <div className="p-3 border rounded">
                <h4 className="font-medium mb-2">What NOT to Manifest</h4>
                <ol className="list-decimal list-inside space-y-1">
                  {result.what_not_to_manifest.map((it, i) => (
                    <li key={i}>{it}</li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 border rounded">
                <h4 className="font-medium mb-2">Thought Alignment</h4>
                <ul className="list-disc list-inside">
                  {result.thought_alignment.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 border rounded">
                <h4 className="font-medium mb-2">Rituals</h4>
                <div className="space-y-3">
                  {result.rituals.map((r, i) => (
                    <div key={i} className="p-2 border rounded-sm">
                      <div className="font-semibold">
                        {r.name}{" "}
                        <span className="text-sm text-gray-500">
                          ({r.frequency})
                        </span>
                      </div>
                      <div className="text-sm text-gray-700">{r.how_to}</div>
                      <div className="text-xs text-gray-500">{r.reason}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <details className="mt-4 p-2 bg-gray-50 rounded">
              <summary className="cursor-pointer text-sm text-gray-700">
                Debug: seed & reasoning
              </summary>
              <pre className="mt-2 text-xs text-gray-700 break-words whitespace-pre-wrap">
                {JSON.stringify(result.seed || {}, null, 2)}
              </pre>
              <pre className="mt-2 text-xs text-gray-700 break-words whitespace-pre-wrap">
                {JSON.stringify(result.reasoning || [], null, 2)}
              </pre>
            </details>
          </div>
        </div>
      )}
    </div>
  );
}

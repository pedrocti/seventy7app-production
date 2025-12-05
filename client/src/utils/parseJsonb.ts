export function parseJsonb(details: any) {
  if (!details) return {}; // empty box if nothing
  if (typeof details === "object") return details; // already a box
  try {
    return JSON.parse(details); // turn string into a box
  } catch (err) {
    console.warn("Failed to read details:", details);
    return { _error: "Invalid details format", raw: details }; // broken box info
  }
}

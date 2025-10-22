export async function loadContentJson() {
  const res = await fetch("./content.json");
  if (!res.ok) throw new Error(`Error loading content.json: ${res.status} ${res.statusText}`);
  return await res.json();
}

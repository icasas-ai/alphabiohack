export function formatTime12h(time: string) {
  const [h, m] = time.split(":").map(Number)
  const isPM = h >= 12
  const hour12 = ((h + 11) % 12) + 1
  return `${hour12}:${m.toString().padStart(2, "0")} ${isPM ? "PM" : "AM"}`
}
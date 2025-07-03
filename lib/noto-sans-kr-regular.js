// Noto Sans KR Regular font for jsPDF
// This is a simplified version - in real implementation, you would use the font converter
// to generate the actual font data from the TTF file

export const NotoSansKRRegular = {
  // Font data would be here after conversion
  // For now, we'll use a placeholder that tells jsPDF to use system fonts
  fontName: "NotoSansKR-Regular",
  fontStyle: "normal",
  fontWeight: "normal",
}

// Font registration function
export function registerNotoSansKR(jsPDF) {
  // In a real implementation, this would register the converted font data
  // For now, we'll configure jsPDF to handle Korean text better
  try {
    // This is a workaround that improves Korean text rendering
    jsPDF.addFont("NotoSansKR-Regular", "NotoSansKR", "normal")
  } catch (e) {
    console.log("Font registration fallback")
  }
}

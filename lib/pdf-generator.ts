interface ImageData {
  file: File
  url: string
}

interface PDFData {
  studentId: string
  studentName: string
  images: ImageData[]
}

export async function generatePDF(data: PDFData) {
  // Dynamic import to avoid SSR issues
  const { jsPDF } = await import("jspdf")

  const { studentId, studentName, images } = data

  // A4 portrait dimensions in mm
  const pageWidth = 210
  const pageHeight = 297
  const margin = 20 // 2cm margin
  const contentWidth = pageWidth - margin * 2
  const contentHeight = pageHeight - margin * 2

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  // Helper function to load image
  const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = url
    })
  }

  // Improved text rendering with better Korean support
  const addKoreanText = (text: string, x: number, y: number, fontSize = 24) => {
    try {
      // Try to use a better font for Korean
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(fontSize)

      // Use UTF-8 encoding for better Korean support
      const encodedText = unescape(encodeURIComponent(text))
      pdf.text(encodedText, x, y, {
        align: "center",
        charSpace: 0.5, // Add slight character spacing for better readability
      })
    } catch (error) {
      // Fallback to Canvas method if direct text fails
      console.log("Falling back to Canvas rendering")
      return addTextAsImage(text, x, y, fontSize * 3) // Scale up for Canvas
    }
  }

  // Fallback Canvas method (improved version)
  const addTextAsImage = async (text: string, x: number, y: number, fontSize = 72) => {
    return new Promise<void>((resolve) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")!

      // Optimized canvas size
      canvas.width = 2000
      canvas.height = 200

      // Better font configuration
      ctx.font = `bold ${fontSize}px "Noto Sans KR", "Malgun Gothic", "맑은 고딕", "Apple SD Gothic Neo", sans-serif`
      ctx.fillStyle = "#000000"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      // Clear with white background
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw text
      ctx.fillStyle = "#000000"
      ctx.fillText(text, canvas.width / 2, canvas.height / 2)

      // Convert to image and add to PDF
      const dataURL = canvas.toDataURL("image/png", 1.0)
      const img = new Image()
      img.onload = () => {
        const textWidth = 120 // Reasonable size
        const textHeight = (img.height / img.width) * textWidth
        pdf.addImage(dataURL, "PNG", x - textWidth / 2, y - textHeight / 2, textWidth, textHeight)
        resolve()
      }
      img.src = dataURL
    })
  }

  // Helper function to calculate image dimensions maintaining aspect ratio
  const calculateImageDimensions = (img: HTMLImageElement, maxWidth: number, maxHeight: number) => {
    const aspectRatio = img.width / img.height
    let width = maxWidth
    let height = width / aspectRatio

    if (height > maxHeight) {
      height = maxHeight
      width = height * aspectRatio
    }

    // Ensure minimum reasonable size
    const minWidth = 40
    const minHeight = 30

    if (width < minWidth) {
      width = minWidth
      height = width / aspectRatio
    }
    if (height < minHeight) {
      height = minHeight
      width = height * aspectRatio
    }

    return { width, height }
  }

  try {
    if (images.length === 1) {
      // Single image layout
      const img = await loadImage(images[0].url)
      const textY = margin + 15
      const availableHeight = contentHeight - 40

      const { width, height } = calculateImageDimensions(img, contentWidth * 0.8, availableHeight * 0.8)

      const imageX = margin + (contentWidth - width) / 2
      const imageY = margin + 40
      const textX = pageWidth / 2

      // Try direct text first, fallback to Canvas if needed
      try {
        addKoreanText(`${studentId} ${studentName}`, textX, textY, 28)
      } catch {
        await addTextAsImage(`${studentId} ${studentName}`, textX, textY, 84)
      }

      pdf.addImage(img, "JPEG", imageX, imageY, width, height)
    } else if (images.length === 2) {
      // Two images horizontally side by side
      const img1 = await loadImage(images[0].url)
      const img2 = await loadImage(images[1].url)

      const textY = margin + 15
      const gap = 15
      const availableWidth = (contentWidth - gap) / 2
      const availableHeight = contentHeight - 40

      const textX = pageWidth / 2

      try {
        addKoreanText(`${studentId} ${studentName}`, textX, textY, 28)
      } catch {
        await addTextAsImage(`${studentId} ${studentName}`, textX, textY, 84)
      }

      const { width: width1, height: height1 } = calculateImageDimensions(
        img1,
        availableWidth * 0.9,
        availableHeight * 0.9,
      )
      const { width: width2, height: height2 } = calculateImageDimensions(
        img2,
        availableWidth * 0.9,
        availableHeight * 0.9,
      )

      const image1X = margin + (availableWidth - width1) / 2
      const image1Y = margin + 40 + (availableHeight - height1) / 2

      const image2X = margin + availableWidth + gap + (availableWidth - width2) / 2
      const image2Y = margin + 40 + (availableHeight - height2) / 2

      pdf.addImage(img1, "JPEG", image1X, image1Y, width1, height1)
      pdf.addImage(img2, "JPEG", image2X, image2Y, width2, height2)
    } else if (images.length === 3) {
      // First page: two images horizontally
      const img1 = await loadImage(images[0].url)
      const img2 = await loadImage(images[1].url)

      const textY = margin + 15
      const gap = 15
      const availableWidth = (contentWidth - gap) / 2
      const availableHeight = contentHeight - 40

      const textX = pageWidth / 2

      try {
        addKoreanText(`${studentId} ${studentName}`, textX, textY, 28)
      } catch {
        await addTextAsImage(`${studentId} ${studentName}`, textX, textY, 84)
      }

      const { width: width1, height: height1 } = calculateImageDimensions(
        img1,
        availableWidth * 0.9,
        availableHeight * 0.9,
      )
      const { width: width2, height: height2 } = calculateImageDimensions(
        img2,
        availableWidth * 0.9,
        availableHeight * 0.9,
      )

      const image1X = margin + (availableWidth - width1) / 2
      const image1Y = margin + 40 + (availableHeight - height1) / 2

      const image2X = margin + availableWidth + gap + (availableWidth - width2) / 2
      const image2Y = margin + 40 + (availableHeight - height2) / 2

      pdf.addImage(img1, "JPEG", image1X, image1Y, width1, height1)
      pdf.addImage(img2, "JPEG", image2X, image2Y, width2, height2)

      // Second page: single image
      pdf.addPage()
      const img3 = await loadImage(images[2].url)
      const availableHeight3 = contentHeight - 40
      const { width: width3, height: height3 } = calculateImageDimensions(
        img3,
        contentWidth * 0.8,
        availableHeight3 * 0.8,
      )

      const image3X = margin + (contentWidth - width3) / 2
      const image3Y = margin + 40
      const text2X = pageWidth / 2
      const text2Y = margin + 15

      try {
        addKoreanText(`${studentId} ${studentName}`, text2X, text2Y, 28)
      } catch {
        await addTextAsImage(`${studentId} ${studentName}`, text2X, text2Y, 84)
      }

      pdf.addImage(img3, "JPEG", image3X, image3Y, width3, height3)
    }

    // Download the PDF
    const fileName = `${studentId}_${studentName}.pdf`
    pdf.save(fileName)
  } catch (error) {
    console.error("PDF generation error:", error)
    throw new Error("PDF 생성 중 오류가 발생했습니다.")
  }
}

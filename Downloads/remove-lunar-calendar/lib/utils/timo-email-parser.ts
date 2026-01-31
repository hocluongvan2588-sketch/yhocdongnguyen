/**
 * Timo Email Parser
 *
 * Parse email notifications from Timo bank to extract transaction details
 * Email từ: support@timo.vn hoặc có chứa "timo"
 */

export interface TimoTransaction {
  transactionId: string
  amount: number
  content: string
  senderInfo?: string
  bankName: "Timo"
  userId?: string
}

/**
 * Parse Timo bank transaction email
 *
 * @param emailFrom - Email sender address
 * @param emailText - Full email body text (plain text or HTML)
 * @returns Parsed transaction or null if failed
 *
 * Email format từ Timo:
 * - Transaction ID: MBVCB.12225147306.5354BFTVG2RR99AD.NAPTEND43E5D4201371170
 * - Amount: "tăng 10.000 VND"
 * - Content: From "Mô tả:" to "Cảm ơn"
 * - Sender: "CT tu 1055116973 LUONG VAN HOC"
 */
export function parseTimoEmail(emailFrom: string, emailText: string): TimoTransaction | null {
  console.log("[v0] ===== Parsing Timo Email =====")
  console.log("[v0] Email from:", emailFrom)
  console.log("[v0] Email length:", emailText.length)

  // Check if email is from Timo
  const normalizedEmail = emailFrom.toLowerCase()
  if (!normalizedEmail.includes("timo") && !normalizedEmail.includes("support@timo.vn")) {
    console.log("[v0] Email is not from Timo")
    return null
  }

  try {
    // 1. Extract amount - Match "tăng 10.000 VND"
    const amountMatch = emailText.match(/(?:tăng|nhận|chuyển|giảm|cộng)\s+([\d.,]+)\s*VND/i)

    if (!amountMatch) {
      console.log("[v0] ❌ Amount not found")
      return null
    }

    // Remove dots and commas, parse as integer
    const cleanAmount = amountMatch[1].replace(/[.,]/g, "")
    const amount = Number.parseFloat(cleanAmount)
    console.log("[v0] ✅ Found amount:", amount, "VND")

    // 2. Extract content - From "Mô tả:" to "Cảm ơn" or "Trân trọng"
    let content = ""

    // Strategy 1: Extract from "Mô tả:" section
    const moTaMatch = emailText.match(/Mô tả[:\s]*(.+?)(?=Cảm ơn|Trân trọng|$)/is)

    if (moTaMatch && moTaMatch[1]) {
      content = moTaMatch[1].trim().replace(/\s+/g, " ")
      console.log("[v0] ✅ Found content from Mô tả:", content.substring(0, 100))
    }

    // Strategy 2: Try to find NAPTEN code specifically
    if (!content) {
      const naptenMatch = emailText.match(/NAPTEN[A-Z0-9]+/i)
      if (naptenMatch) {
        content = naptenMatch[0]
        console.log("[v0] ✅ Found NAPTEN code:", content)
      }
    }

    // Fallback
    if (!content) {
      content = "Timo transaction - no content found"
      console.log("[v0] ⚠️ No content found, using fallback")
    }

    // 3. Extract transaction ID
    let transactionId = ""

    // Try full MBVCB format first
    const fullMbvcbMatch = emailText.match(/MBVCB\.\d+\.[A-Z0-9]+\.[A-Z0-9]+\.[A-Z0-9]+/i)

    if (fullMbvcbMatch) {
      transactionId = fullMbvcbMatch[0]
      console.log("[v0] ✅ Found full MBVCB transaction ID:", transactionId)
    } else {
      // Try shorter MBVCB format
      const mbvcbMatch = emailText.match(/MBVCB\.\d+\.[A-Z0-9]+/i)

      if (mbvcbMatch) {
        transactionId = mbvcbMatch[0]
        console.log("[v0] ✅ Found MBVCB transaction ID:", transactionId)
      } else {
        // Try NAPTEN code
        const naptenMatch = emailText.match(/NAPTEN[A-Z0-9]+/i)

        if (naptenMatch) {
          transactionId = naptenMatch[0]
          console.log("[v0] ✅ Found NAPTEN transaction ID:", transactionId)
        } else {
          // Generate fallback ID
          transactionId = `TIMO_${Date.now()}_${amount}`
          console.log("[v0] ⚠️ No transaction ID found, generated:", transactionId)
        }
      }
    }

    // 4. Extract sender info (optional)
    // Format: "CT tu 1055116973 LUONG VAN HOC"
    let senderInfo: string | undefined
    const senderMatch = emailText.match(/CT\s+tu\s+(\d+)\s+([A-Z\s]+?)(?=\s+toi|\s+tai|$)/i)

    if (senderMatch) {
      senderInfo = `${senderMatch[1]} ${senderMatch[2].trim()}`
      console.log("[v0] ✅ Found sender info:", senderInfo)
    }

    // 5. Extract user ID from content
    const userId = extractUserIdFromContent(content)
    if (userId) {
      console.log("[v0] ✅ Extracted user ID:", userId)
    }

    const transaction: TimoTransaction = {
      transactionId,
      amount,
      content,
      senderInfo,
      bankName: "Timo",
      userId,
    }

    console.log("[v0] ===== Parse Complete - SUCCESS =====")
    console.log("[v0] Transaction:", JSON.stringify(transaction, null, 2))

    return transaction
  } catch (error) {
    console.error("[v0] ===== Parse Complete - ERROR =====")
    console.error("[v0] Error parsing Timo email:", error)
    return null
  }
}

/**
 * Extract user ID from payment content
 *
 * @param content - Payment content containing NAPTEN code
 * @returns User ID or undefined
 */
function extractUserIdFromContent(content: string): string | undefined {
  const patterns = [
    /NAPTEN([A-Z0-9]{32})/i, // Full UUID without hyphens
    /NAPTEN([A-Z0-9]{12})/i, // Short format: 8 chars userId + 4 random
    /NAPTEN([A-Z0-9]+)/i,
  ]

  for (const pattern of patterns) {
    const match = content.match(pattern)

    if (match && match[1]) {
      const extractedId = match[1]

      // If it's a full 32-char UUID, format it
      if (extractedId.length === 32 && /^[A-Z0-9]{32}$/i.test(extractedId)) {
        const formatted =
          `${extractedId.substring(0, 8)}-${extractedId.substring(8, 12)}-${extractedId.substring(12, 16)}-${extractedId.substring(16, 20)}-${extractedId.substring(20, 32)}`.toLowerCase()
        console.log("[v0] Formatted UUID:", formatted)
        return formatted
      }

      // If it's a 12-char code, extract the first 8 as user ID prefix
      if (extractedId.length === 12 && /^[A-Z0-9]{12}$/i.test(extractedId)) {
        const userIdPrefix = extractedId.substring(0, 8).toLowerCase()
        console.log("[v0] Extracted user ID prefix:", userIdPrefix)
        return userIdPrefix
      }

      return extractedId
    }
  }

  return undefined
}

/**
 * Check if email is from Timo
 *
 * @param emailFrom - Email sender address
 * @returns true if from Timo
 */
export function isTimoEmail(emailFrom: string): boolean {
  const normalized = emailFrom.toLowerCase()
  return normalized.includes("timo") || normalized.includes("support@timo.vn")
}

export default {
  parseTimoEmail,
  isTimoEmail,
}

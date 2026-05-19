import type { MonitorItem, NormalizedMonitorItem, UsagePair } from "@/components/custom/monitor-types"

export const parsePercent = (value?: string) => {
  if (!value) return 0
  const parsed = Number.parseFloat(value.replace("%", ""))
  return Number.isFinite(parsed) ? parsed : 0
}

export const parseSizeToBytes = (value?: string) => {
  if (!value) return 0
  const match = value.trim().match(/^([\d.]+)\s*([a-zA-Z]+)?$/)
  if (!match) return 0
  const amount = Number.parseFloat(match[1])
  if (!Number.isFinite(amount)) return 0
  const unit = (match[2] ?? "B").toUpperCase()
  const base = unit.includes("I") ? 1024 : 1000

  switch (unit) {
    case "B":
      return amount
    case "KB":
      return amount * Math.pow(base, 1)
    case "MB":
      return amount * Math.pow(base, 2)
    case "GB":
      return amount * Math.pow(base, 3)
    case "TB":
      return amount * Math.pow(base, 4)
    case "KIB":
      return amount * Math.pow(1024, 1)
    case "MIB":
      return amount * Math.pow(1024, 2)
    case "GIB":
      return amount * Math.pow(1024, 3)
    case "TIB":
      return amount * Math.pow(1024, 4)
    default:
      return amount
  }
}

export const parseUsagePair = (value?: string): UsagePair => {
  if (!value) return { usedBytes: 0, totalBytes: 0 }
  const [usedPart, totalPart] = value.split("/").map((item) => item.trim())
  return {
    usedBytes: parseSizeToBytes(usedPart),
    totalBytes: parseSizeToBytes(totalPart),
  }
}

export const formatBytes = (bytes: number) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B"
  const base = 1024
  const units = ["B", "KB", "MB", "GB", "TB"]
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(base)), units.length - 1)
  const value = bytes / Math.pow(base, exponent)
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 2)} ${units[exponent]}`
}

export const normalizeMonitorItems = (items: MonitorItem[]): NormalizedMonitorItem[] =>
  items.map((item) => {
    const memUsage = parseUsagePair(item.MemUsage)
    const netUsage = parseUsagePair(item.NetIO)
    const blockUsage = parseUsagePair(item.BlockIO)

    return {
      ...item,
      cpu: parsePercent(item.CPUPerc),
      mem: parsePercent(item.MemPerc),
      memUsedBytes: memUsage.usedBytes,
      memTotalBytes: memUsage.totalBytes,
      netRxBytes: netUsage.usedBytes,
      netTxBytes: netUsage.totalBytes,
      blockReadBytes: blockUsage.usedBytes,
      blockWriteBytes: blockUsage.totalBytes,
    }
  })

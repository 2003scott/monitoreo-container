export type MonitorItem = {
  BlockIO: string
  CPUPerc: string
  Container: string
  ID: string
  MemPerc: string
  MemUsage: string
  Name: string
  NetIO: string
  PIDs: string
}

export type NormalizedMonitorItem = MonitorItem & {
  cpu: number
  mem: number
  memUsedBytes: number
  memTotalBytes: number
  netRxBytes: number
  netTxBytes: number
  blockReadBytes: number
  blockWriteBytes: number
}

export type UsagePair = {
  usedBytes: number
  totalBytes: number
}

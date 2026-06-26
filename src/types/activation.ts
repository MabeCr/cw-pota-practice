import type { Station } from './station'

export interface QSO {
  date: string
  theirCall: string
  sentRST: string
  receivedRST: string
  theirState: string
  theirPark?: string
}

export interface ChatMessage {
  originator: string
  message: string
}

export interface Activation {
  id: string
  parkReference: string
  parkName: string
  parkState?: string
  callsign: string
  startedAt: string
  endedAt: string | null
  qsoList: QSO[]
  chatHistory: ChatMessage[]
  activeHunters?: Station[]
}

import type { Station } from './station'

export type QsoValidationMode = 'none' | 'immediate' | 'completed'

export interface GroundTruthEntry {
  callsign: string
  rst: string
  stateCode: string
  park2parkId: string | null
}

export interface QSO {
  date: string
  theirCall: string
  sentRST: string
  receivedRST: string
  theirState: string
  theirPark?: string
  correct?: boolean | null  // undefined=no validation, null=pending reveal, true/false=result
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
  validationMode?: QsoValidationMode
  qsoGroundTruth?: GroundTruthEntry[]
}

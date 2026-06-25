export interface QSO {
  date: string
  theirCall: string
  sentRST: string
  receivedRST: string
  theirState: string
}

export interface ChatMessage {
  originator: string
  message: string
}

export interface Activation {
  id: string
  parkReference: string
  parkName: string
  callsign: string
  startedAt: string
  endedAt: string | null
  qsoList: QSO[]
  chatHistory: ChatMessage[]
}

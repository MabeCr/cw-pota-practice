import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Station } from '@/types/station';
import type { QsoSteps } from '@/constants/qsoStates';

export interface StationQsoState {
  station: Station;
  currentStep: QsoSteps;
  messageHistory: string[];
  isCompleted: boolean;
}

export const useQsoStore = defineStore('qso', () => {
  // Map of callsign to station QSO state
  const stationStates = ref<Map<string, StationQsoState>>(new Map());
  
  // Get all active stations (not completed)
  const activeStations = computed(() => {
    return Array.from(stationStates.value.values()).filter(
      state => !state.isCompleted
    );
  });

  // Get a specific station's QSO state
  const getStationState = (callsign: string): StationQsoState | undefined => {
    return stationStates.value.get(callsign);
  };

  // Add a new station to the QSO
  const addStation = (station: Station): void => {
    const callsign = station.callsign;
    if (!stationStates.value.has(callsign)) {
      stationStates.value.set(callsign, {
        station: { ...station, qsoStep: station.qsoStep || 'CQ' },
        currentStep: station.qsoStep || 'CQ',
        messageHistory: [],
        isCompleted: false,
      });
    }
  };

  // Update the current step for a station
  const updateQsoStep = (callsign: string, step: QsoSteps): void => {
    const state = stationStates.value.get(callsign);
    if (state) {
      state.currentStep = step;
      state.station.qsoStep = step;
    }
  };

  // Mark a station as completed
  const completeQso = (callsign: string): void => {
    const state = stationStates.value.get(callsign);
    if (state) {
      state.isCompleted = true;
      state.currentStep = 'COMPLETED';
      state.station.qsoStep = 'COMPLETED';
    }
  };

  // Remove completed stations
  const cleanupCompleted = (): void => {
    for (const [callsign, state] of stationStates.value.entries()) {
      if (state.isCompleted) {
        stationStates.value.delete(callsign);
      }
    }
  };

  // Add a message to a station's history
  const addMessageToHistory = (callsign: string, message: string, originator: string): void => {
    const state = stationStates.value.get(callsign);
    if (state) {
      state.messageHistory.push(`${originator}: ${message}`);
    }
  };

  // Get all callsigns
  const getAllCallsigns = (): string[] => {
    return Array.from(stationStates.value.keys());
  };

  return {
    stationStates,
    activeStations,
    getStationState,
    addStation,
    updateQsoStep,
    completeQso,
    cleanupCompleted,
    addMessageToHistory,
    getAllCallsigns,
  };
});
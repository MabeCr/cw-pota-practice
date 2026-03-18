<script lang="ts" setup>
import { ref, nextTick, watch, useTemplateRef, computed } from 'vue';
import { useQsoUtils } from '../composables/useQsoUtils';

interface QSO {
    date: string;
    theirCall: string;
    sentRST: string;
    receivedRST: string;
    theirState: string;
}

const tableContainer = useTemplateRef('tableContainer');
const theirCallInput = useTemplateRef('theirCallInput');

const theirCallError = computed(() => {
    return !useQsoUtils().validateCall(newQSO.value.theirCall.toUpperCase());
});

const sentRstError = computed(() => {
    return !useQsoUtils().validateRST(newQSO.value.sentRST);
});

const receivedRstError = computed(() => {
    return !useQsoUtils().validateRST(newQSO.value.receivedRST);
});

const stateError = computed(() => {
    return !useQsoUtils().validateState(newQSO.value.theirState);
});

const qsoList = ref<QSO[]>([]);

const newQSO = ref<QSO>({
    date: '',
    theirCall: '',
    sentRST: '',
    receivedRST: '',
    theirState: '',
});

function addQSO() {
    newQSO.value.date = new Date().toLocaleTimeString('en-US', {timeZone: 'UTC', hour12: false, hour: '2-digit', minute: '2-digit'})+'z';
    newQSO.value.theirCall = newQSO.value.theirCall.toUpperCase().replace(/\s+/g, "");
    newQSO.value.sentRST = newQSO.value.sentRST.replace(/\s+/g, "");
    newQSO.value.receivedRST = newQSO.value.receivedRST.replace(/\s+/g, "");
    newQSO.value.theirState = newQSO.value.theirState.replace(/\s+/g, "");

    let validQSO = true;
    //Perform Input Validation
    if (!useQsoUtils().validateCall(newQSO.value.theirCall)) {
        console.log('Their call is not valid');
        validQSO = false;
    }

    if (!useQsoUtils().validateRST(newQSO.value.receivedRST)) {
        console.log('Received RST is not valid');
        validQSO = false;
    } 

    if (!useQsoUtils().validateRST(newQSO.value.sentRST)) {
        console.log('Sent RST is not valid');
        validQSO = false;
    }

    if (!useQsoUtils().validateState(newQSO.value.theirState)) {
        console.log('State is not valid');
        validQSO = false;
    }

    // If the QSO is invalid, we need to break outta here.
    if ( !validQSO ) {
        return;
    }

    qsoList.value.push(newQSO.value);
    newQSO.value = {
        date: '',
        theirCall: '',
        sentRST: '',
        receivedRST: '',
        theirState: '',
    };

    if (theirCallInput.value) {
        theirCallInput.value.focus();
    }
}

watch(qsoList, async() => {
    await nextTick();
    const container = tableContainer.value;
    if (container) {
        container.scrollTop = container.scrollHeight;
    }
}, { deep: true });
</script>

<template>
  <div class="container">
    <h1>QSO List</h1>
    <div class="table-container" ref="tableContainer">
    <table class="qso-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Their Call</th>
          <th>Sent RST</th>
          <th>Received RST</th>
          <th>Their State</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(qso, index) in qsoList" :key="index">
          <td>{{ qso.date }}</td>
          <td>{{ qso.theirCall }}</td>
          <td>{{ qso.sentRST }}</td>
          <td>{{ qso.receivedRST }}</td>
          <td>{{ qso.theirState }}</td>
        </tr>
      </tbody>
    </table>
    </div>
  <div class="input-container">
      <div class="input-field">
        <label for="callsign">Callsign:</label>
        <input id="callsign" v-model="newQSO.theirCall" type="text" ref="theirCallInput" :class="{ 'error': theirCallError }" @keydown.enter="addQSO">
      </div>
      <div class="input-field">
        <label for="sentRST">Sent RST:</label>
        <input id="sentRST" v-model="newQSO.sentRST" type="text" @keydown.enter="addQSO" :class="{ 'error': sentRstError }">
      </div>
      <div class="input-field">
        <label for="receivedRST">Received RST:</label>
        <input id="receivedRST" v-model="newQSO.receivedRST" type="text" @keydown.enter="addQSO" :class="{ 'error': receivedRstError }">
      </div>
      <div class="input-field">
        <label for="theirState">Their State:</label>
        <input id="theirState" v-model="newQSO.theirState" type="text" @keydown.enter="addQSO" :class="{ 'error': stateError }">
      </div>
      <button class="add-button" @click="addQSO">Add QSO</button>
    </div>
  </div>
</template>

<style>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 80vw;
  margin: 0 auto;
}

.table-container {
  height: 500px;
  overflow: auto;
  display: flex;
  flex-direction: column;
}

.qso-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.qso-table th,
.qso-table td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.qso-table th {
  background-color: #f0f0f0;
}

.qso-table tr:hover {
  background-color: #f5f5f5;
}

.input-container {
  display: flex;
  align-items: flex-start;
  margin-top: 10px;
}

.input-field {
  flex: 1;
  margin-right: 10px;
}

.input-field label {
  display: block;
  margin-bottom: 5px;
}

.input-field input {
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 80%;
}

.add-button {
  margin-top: 3%;
}

.error {
    border-color: red !important;
}
</style>
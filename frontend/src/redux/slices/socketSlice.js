// redux/slices/socketSlice.js
// Tracks socket connection status for display in UI (e.g. status indicator).

import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  isConnected: false,
  connectionError: null,
}

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    socketConnected(state) {
      state.isConnected = true
      state.connectionError = null
    },
    socketDisconnected(state) {
      state.isConnected = false
    },
    socketError(state, action) {
      state.isConnected = false
      state.connectionError = action.payload
    },
  },
})

export const { socketConnected, socketDisconnected, socketError } = socketSlice.actions

export const selectIsSocketConnected  = (state) => state.socket.isConnected
export const selectSocketError        = (state) => state.socket.connectionError

export default socketSlice.reducer

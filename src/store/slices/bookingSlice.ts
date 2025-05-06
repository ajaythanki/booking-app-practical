import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../constants';

export type BookingType = 'FULL_DAY' | 'HALF_DAY' | 'CUSTOM';
export type BookingSlot = 'FIRST_HALF' | 'SECOND_HALF' | null;

export interface Booking {
  id: number;
  customerName: string;
  customerEmail: string;
  bookingDate: string;
  bookingType: BookingType;
  bookingSlot: BookingSlot;
  startTime: string | null;
  endTime: string | null;
  createdAt: string;
}

interface BookingState {
  bookings: Booking[];
  currentBooking: Booking | null;
  isLoading: boolean;
  error: string | null;
  success: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

const initialState: BookingState = {
  bookings: [],
  currentBooking: null,
  isLoading: false,
  error: null,
  success: false,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

export const createBooking = createAsyncThunk(
  'booking/create',
  async (bookingData: Omit<Booking, 'id' | 'createdAt'>, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string } };
      const config = {
        headers: {
          Authorization: `Bearer ${state.auth.token}`,
        },
      };
      
      const response = await axios.post(API_URL+'/api/bookings', bookingData, config);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create booking');
    }
  }
);

export const getBookings = createAsyncThunk(
  'booking/getAll',
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string } };
      const config = {
        headers: {
          Authorization: `Bearer ${state.auth.token}`,
        },
      };
      
      const response = await axios.get(API_URL+`/api/bookings?page=${page}&limit=${limit}`, config);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookings');
    }
  }
);

export const getBookingsByDate = createAsyncThunk(
  'booking/getByDate',
  async (date: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL+`/api/bookings/date/${date}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookings for date');
    }
  }
);

export const checkAvailability = createAsyncThunk(
  'booking/checkAvailability',
  async (bookingData: { 
    bookingDate: string; 
    bookingType: BookingType; 
    bookingSlot?: BookingSlot; 
    startTime?: string; 
    endTime?: string 
  }, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL+'/api/bookings/check-availability', bookingData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check availability');
    }
  }
);

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    clearBookingState: (state) => {
      state.error = null;
      state.success = false;
    },
    setCurrentBooking: (state, action: PayloadAction<Booking | null>) => {
      state.currentBooking = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBooking.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createBooking.fulfilled, (state, action: PayloadAction<Booking>) => {
        state.isLoading = false;
        state.success = true;
        state.bookings.unshift(action.payload);
      })
      .addCase(createBooking.rejected, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(getBookings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBookings.fulfilled, (state, action: PayloadAction<{ bookings: Booking[]; total: number; page: number; limit: number }>) => {
        state.isLoading = false;
        state.bookings = action.payload.bookings;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
        };
      })
      .addCase(getBookings.rejected, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(getBookingsByDate.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBookingsByDate.fulfilled, (state, action: PayloadAction<Booking[]>) => {
        state.isLoading = false;
        state.bookings = action.payload;
      })
      .addCase(getBookingsByDate.rejected, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(checkAvailability.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkAvailability.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(checkAvailability.rejected, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearBookingState, setCurrentBooking } = bookingSlice.actions;
export default bookingSlice.reducer;
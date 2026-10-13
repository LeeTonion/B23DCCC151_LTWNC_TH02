import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Assignment, AssignmentFormData, AssignmentStats } from '@/types/assignment';
import { generateId, calcStats } from '@/lib/utils';

// Mock API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Initial mock data
const initialAssignments: Assignment[] = [
  {
    id: '1',
    subject: 'Toán rời rạc',
    title: 'Bài tập chương 1: Logic mệnh đề',
    dueDate: '2026-10-20T23:59:00',
    priority: 'high',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    subject: 'Cấu trúc dữ liệu',
    title: 'Bài tập cây nhị phân tìm kiếm',
    dueDate: '2026-10-18T23:59:00',
    priority: 'high',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    subject: 'Lập trình web',
    title: 'Project React: Todo App',
    dueDate: '2026-10-25T23:59:00',
    priority: 'medium',
    completed: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    subject: 'Cơ sở dữ liệu',
    title: 'Thiết kế ERD cho hệ thống thư viện',
    dueDate: '2026-10-15T23:59:00',
    priority: 'low',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    subject: 'Mạng máy tính',
    title: 'Bài tập routing OSPF',
    dueDate: '2026-10-22T23:59:00',
    priority: 'medium',
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

// Async thunks
export const fetchAssignments = createAsyncThunk<Assignment[], void, { rejectValue: string }>(
  'assignments/fetchAssignments',
  async (_, { rejectWithValue: _rejectWithValue }) => {
    await delay(500); // Simulate network delay
    return initialAssignments;
  }
);

export const addAssignmentAsync = createAsyncThunk<Assignment, AssignmentFormData, { rejectValue: string }>(
  'assignments/addAssignmentAsync',
  async (data, { rejectWithValue: _rejectWithValue }) => {
    await delay(300);
    const newAssignment: Assignment = {
      ...data,
      id: generateId(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    return newAssignment;
  }
);

export const deleteAssignmentAsync = createAsyncThunk<string, string, { rejectValue: string }>(
  'assignments/deleteAssignmentAsync',
  async (id, { rejectWithValue: _rejectWithValue }) => {
    await delay(200);
    return id;
  }
);

export const toggleAssignmentAsync = createAsyncThunk<{ id: string; completed: boolean }, string, { rejectValue: string; state: { assignments: AssignmentsState } }>(
  'assignments/toggleAssignmentAsync',
  async (id, { rejectWithValue, getState }) => {
    await delay(200);
    // Get current assignment state to toggle properly
    const state = getState();
    const assignment = state.assignments.items.find((a) => a.id === id);
    if (!assignment) {
      return rejectWithValue('Assignment not found');
    }
    return { id, completed: !assignment.completed };
  }
);

interface AssignmentsState {
  items: Assignment[];
  stats: AssignmentStats;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  filter: 'all' | 'pending' | 'overdue' | 'completed';
  searchTerm: string;
}

const initialState: AssignmentsState = {
  items: [],
  stats: {
    total: 0,
    completed: 0,
    overdue: 0,
    pending: 0,
    bySubject: {},
  },
  status: 'idle',
  error: null,
  filter: 'all',
  searchTerm: '',
};

const assignmentsSlice = createSlice({
  name: 'assignments',
  initialState,
  reducers: {
    addAssignment: (state, action: PayloadAction<AssignmentFormData>) => {
      const newAssignment: Assignment = {
        ...action.payload,
        id: generateId(),
        completed: false,
        createdAt: new Date().toISOString(),
      };
      state.items.push(newAssignment);
      state.stats = calcStats(state.items);
    },
    deleteAssignment: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((a) => a.id !== action.payload);
      state.stats = calcStats(state.items);
    },
    toggleComplete: (state, action: PayloadAction<string>) => {
      const assignment = state.items.find((a) => a.id === action.payload);
      if (assignment) {
        assignment.completed = !assignment.completed;
        state.stats = calcStats(state.items);
      }
    },
    setFilter: (state, action: PayloadAction<'all' | 'pending' | 'overdue' | 'completed'>) => {
      state.filter = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    addSampleAssignments: (state, action: PayloadAction<Assignment[]>) => {
      state.items.push(...action.payload);
      state.stats = calcStats(state.items);
    },
    clearAll: (state) => {
      state.items = [];
      state.stats = calcStats([]);
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAssignments
      .addCase(fetchAssignments.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAssignments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.stats = calcStats(action.payload);
      })
      .addCase(fetchAssignments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Failed to fetch assignments';
      })
      // addAssignmentAsync
      .addCase(addAssignmentAsync.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.stats = calcStats(state.items);
      })
      // deleteAssignmentAsync
      .addCase(deleteAssignmentAsync.fulfilled, (state, action) => {
        state.items = state.items.filter((a) => a.id !== action.payload);
        state.stats = calcStats(state.items);
      })
      // toggleAssignmentAsync
      .addCase(toggleAssignmentAsync.fulfilled, (state, action) => {
        const assignment = state.items.find((a) => a.id === action.payload.id);
        if (assignment) {
          assignment.completed = action.payload.completed;
          state.stats = calcStats(state.items);
        }
      });
  },
});

export const {
  addAssignment,
  deleteAssignment,
  toggleComplete,
  setFilter,
  setSearchTerm,
  addSampleAssignments,
  clearAll,
} = assignmentsSlice.actions;

export default assignmentsSlice.reducer;

// Selectors
export const selectAssignments = (state: { assignments: AssignmentsState }) => state.assignments.items;
export const selectAssignmentsStats = (state: { assignments: AssignmentsState }) => state.assignments.stats;
export const selectAssignmentsStatus = (state: { assignments: AssignmentsState }) => state.assignments.status;
export const selectAssignmentsError = (state: { assignments: AssignmentsState }) => state.assignments.error;
export const selectFilter = (state: { assignments: AssignmentsState }) => state.assignments.filter;
export const selectSearchTerm = (state: { assignments: AssignmentsState }) => state.assignments.searchTerm;
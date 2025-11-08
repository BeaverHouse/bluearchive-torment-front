import { useReducer, useCallback } from "react";
import { PartyFilterState, PartyFilterAction } from "@/types/filter";

const initialFilterState: PartyFilterState = {
  scoreRange: undefined,
  includeList: [],
  excludeList: [],
  assist: undefined,
  partyCountRange: [0, 99],
  hardExclude: false,
  allowDuplicate: true,
  youtubeOnly: false,
};

function partyFilterReducer(
  state: PartyFilterState,
  action: PartyFilterAction
): PartyFilterState {
  switch (action.type) {
    case "SET_SCORE_RANGE":
      return { ...state, scoreRange: action.payload };
    case "SET_INCLUDE_LIST":
      return { ...state, includeList: action.payload };
    case "SET_EXCLUDE_LIST":
      return { ...state, excludeList: action.payload };
    case "SET_ASSIST":
      return { ...state, assist: action.payload };
    case "SET_PARTY_COUNT_RANGE":
      return { ...state, partyCountRange: action.payload };
    case "SET_HARD_EXCLUDE":
      return { ...state, hardExclude: action.payload };
    case "SET_ALLOW_DUPLICATE":
      return { ...state, allowDuplicate: action.payload };
    case "SET_YOUTUBE_ONLY":
      return { ...state, youtubeOnly: action.payload };
    case "UPDATE_FILTERS":
      return { ...state, ...action.payload };
    case "RESET_FILTERS":
      return { ...initialFilterState, ...action.payload };
    default:
      return state;
  }
}

/**
 * Custom hook for managing party filter state with useReducer
 * @param initialState Initial filter state (optional)
 * @returns Object containing filter state and helper functions
 */
export function usePartyFilter(initialState?: Partial<PartyFilterState>) {
  const [state, dispatch] = useReducer(partyFilterReducer, {
    ...initialFilterState,
    ...initialState,
  });

  const updateFilters = useCallback((updates: Partial<PartyFilterState>) => {
    dispatch({ type: "UPDATE_FILTERS", payload: updates });
  }, []);

  const resetFilters = useCallback(
    (overrides?: Partial<PartyFilterState>) => {
      dispatch({ type: "RESET_FILTERS", payload: overrides });
    },
    []
  );

  return {
    filters: state,
    updateFilters,
    resetFilters,
    dispatch,
  };
}

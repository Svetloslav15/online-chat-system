import * as actionTypes from '../actions/types';

const initialState = {
    currentChannel: null
};

const channelReducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.SET_CURRENT_CHANNEL:
            return {
                ...state,
                currentChannel: action.payload.currentChannel
            };
        default:
            return state;
    }

};

export default channelReducer;
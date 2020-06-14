import api from '../util/api';

export const partyService = {
    getAllParty,
    getPartyById,
    createParty,
    joinParty,
    leaveParty,
    deleteParty
};

async function getAllParty() {
    let response = await api.get("/parties", {
        params: {
            size: 100
        }
    });
    return response.data;
}

async function getPartyById(id) {
    let response = await api.get(`/parties/${id}`);
    return response.data;
}

async function createParty(data) {
    let response = await api.post("/parties", data);
    return response.data;
}

async function joinParty(id) {
    let response = await api.put(`/parties/${id}/join`);
    return response.data;
}

async function leaveParty(id) {
    let response = await api.put(`/parties/${id}/leave`);
    return response.data;
}

async function deleteParty(id) {
    let response = await api.delete(`/parties/${id}`);
    return response.data;
}
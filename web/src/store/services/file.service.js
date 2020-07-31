import api from '../util/api';

export const fileService = {
    uploadPicture
};

async function uploadPicture(file) {
    const data = new FormData();
    data.append('file', file);
    let response = await api.post("/pictures/upload", data, {});
    return response.data;
}
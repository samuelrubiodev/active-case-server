import axios from "axios";

async function downloadImageToBuffer(url) {
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'arraybuffer'
    });

    const buffer = Buffer.from(response.data, 'binary');
    return buffer;
}

export { downloadImageToBuffer };
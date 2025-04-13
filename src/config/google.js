/* 
Google Drive API:
Demonstration to:
1. upload 
2. delete 
3. create public URL of a file.
required npm package: googleapis
*/
const { google } = require("googleapis");
const fs = require("fs");

const CLIENT_ID = "750952142635-88nlfvpfim9o948d80gunb4ppea23rjh.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "https://developers.google.com/oauthplayground";

const REFRESH_TOKEN = "1//04U0NNhttpWRgCgYIARAAGAQSNwF-L9Ir5Z2M8Ftw31S1PJgKfI4r2LQ3G4AFp2OwvhlJgt5q9OS_co3cML0J72X0P_ASignSmNo";
const folderId = "1LeC4qg-Foihz1lEwgK7w_5lZimJ1XihE"; // ID thư mục đích

const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({
    version: "v3",
    auth: oauth2Client,
});

// Sửa hàm uploadFileGoogle để nhận đúng full path:
async function uploadFileGoogle(filePath, name, mimeType = "image/jpeg") {
    try {
        const response = await drive.files.create({
            requestBody: {
                name: name,
                mimeType: mimeType,
                parents: [folderId],
            },
            media: {
                mimeType: mimeType,
                body: fs.createReadStream(filePath),
            },
        });

        await drive.permissions.create({
            fileId: response.data.id,
            requestBody: {
                role: "reader",
                type: "anyone",
            },
        });

        const result = await drive.files.get({
            fileId: response.data.id,
            fields: "webViewLink, webContentLink",
        });

        return result.data;
    } catch (error) {
        console.log("Lỗi: ", error.message);
        throw new Error("Upload failed");
    }
}

// uploadFileGoogle();

async function deleteFileGoogle(id) {
    try {
        console.log("ID file:", id);

        const response = await drive.files.delete({
            fileId: id.split("&")[0],
        });
        console.log(response.data, response.status);
    } catch (error) {
        console.log(error.message);
    }
}

// deleteFileGoogle();

async function generatePublicUrl(id) {
    try {
        const fileId = id;
        await drive.permissions.create({
            fileId: fileId,
            requestBody: {
                role: "reader",
                type: "anyone",
            },
        });

        /* 
    webViewLink: View the file in browser
    webContentLink: Direct download link 
    */
        const result = await drive.files.get({
            fileId: fileId,
            fields: "webViewLink, webContentLink",
        });
        console.log(result.data);
    } catch (error) {
        console.log(error.message);
    }
}

export { uploadFileGoogle, deleteFileGoogle, generatePublicUrl };

// generatePublicUrl();

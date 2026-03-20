import Share from 'react-native-share';
import RNFS from 'react-native-fs';

export const file_share = async (base64Data: any, fileName: string, fileType: string) => {
    try {
        // Define path in cache directory
        const path = `${RNFS.CachesDirectoryPath}/${fileName}.${fileType}`;

        // Write the file
        await RNFS.writeFile(path, base64Data, 'base64');
        console.log('File written to:', path);

        // Open with Share / Other apps
        await Share.open({
            url: `file://${path}`,
            type: `${fileType === 'pdf' ? 'application/pdf' : 'image/*'}`, // adjust MIME type
        });

    } catch (error) {
        console.log('Error opening file:', error);
    }
};

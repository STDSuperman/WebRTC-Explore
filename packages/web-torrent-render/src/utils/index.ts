export const promisifyFileGetBlob = (file: any): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file) reject('');
    file.getBlobURL(async (e: Error, blobUrl: string) => {
      if (e) {
        reject('');
        return null;
      }
      resolve(blobUrl);
    });
  })
}
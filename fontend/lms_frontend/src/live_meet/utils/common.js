export function toGoogleDriveEmbedUrl(url) {
  if (!url) return undefined;

  const regExp = /\/d\/([^/]+)/;
  const match = url.match(regExp);
  
  if (match && match[1]) {
    const fileId = match[1];
    return `https://lh3.googleusercontent.com/u/0/d/${fileId}`;
  }

  return undefined;
}

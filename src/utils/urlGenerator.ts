// Generate a random short code
export const generateShortCode = (length = 7): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
};

// Simulate fraud validation function (takes 100ms)
export const validateClick = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // For simulation purposes, 80% of clicks pass validation
      const isValid = Math.random() < 0.8;
      resolve(isValid);
    }, 100);
  });
};

// Tiny module-level store so the floating ChatAssistant (mounted once at the app
// root) always knows what article the reader is currently on.
let currentContext = "";
export const setChatContext = (text: string) => { currentContext = text; };
export const getChatContext = () => currentContext;

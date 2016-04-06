let root = typeof window !== 'undefined' && window;

let trident = root && root.navigator.userAgent.indexOf('Trident') || -1;
let isOldIE = trident >= 0;

export function isIE() { return isOldIE; }

export default isIE;
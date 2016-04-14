let root = typeof window !== 'undefined' && window;

let trident = root && root.navigator.userAgent.indexOf('Trident') || -1;
let isOldIE = trident >= 0;
if (isOldIE) {
  let myNav = navigator.userAgent.toLowerCase();
  isOldIE = (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : true;
}

export function isIE() { return isOldIE; }

export default isIE;
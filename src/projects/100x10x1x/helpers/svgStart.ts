export const svgStart = /* html */ `
<?xml version="1.0" encoding="utf-8"?><svg viewBox="0 0 2160 3840" xmlns="http://www.w3.org/2000/svg">
<filter id="Bevel" filterUnits="objectBoundingBox" x="-10%" y="-10%" width="150%" height="150%">
  <feGaussianBlur in="SourceAlpha" stdDeviation="5" result="blur"/>
  <feSpecularLighting in="blur" surfaceScale="1" specularConstant=".2" specularExponent="120" result="specOut" lighting-color="pink">
    <fePointLight x="-5000" y="-10000" z="20000"/>
  </feSpecularLighting>
  <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut2"/>
  <feComposite in="SourceGraphic" in2="specOut2" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litPaint" />
</filter>`;

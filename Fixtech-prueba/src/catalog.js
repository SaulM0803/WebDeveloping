export const models = [
 ...[17,16,15,14,13,12,11].flatMap(n => [['', ''],[' Pro','-pro'],[' Pro Max','-promax']].map(([label,suffix])=>({id:`iphone-${n}${suffix}`,name:`iPhone ${n}${label}`,brand:'Apple',image:`iphone-${n}${suffix}.png`}))),
 ...['X','XR','XS'].map(n=>({id:`iphone-${n.toLowerCase()}`,name:`iPhone ${n}`,brand:'Apple',image:`iphone-${n.toLowerCase()}.png`})),
 ...[26,25,24,23,22,21,20].map(n=>({id:`s${n}`,name:`Galaxy S${n}`,brand:'Samsung',image:`S${n}.png`})),
 ...[7,6,5,4,3,2].map(n=>({id:`fold${n}`,name:`Galaxy Z Fold${n}`,brand:'Samsung',image:`zfold${n}.png`})),
 ...[7,6,5,4,3,''].map(n=>({id:`flip${n}`,name:`Galaxy Z Flip${n}`,brand:'Samsung',image:`ZFLIP${n}.PNG`})),
 ...[52,32,12].map(n=>({id:`a${n}`,name:`Galaxy A${n}`,brand:'Samsung',image:`a${n}.png`}))
];
export const repairs=['screen','battery','back','charging','camera','diagnosis'];

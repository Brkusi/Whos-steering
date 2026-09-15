import { audiB9Configuration, audiB9Parts } from './audiB9Configuration';
import { DEFAULT_CONFIG, COLORS, TOP_BOTTOM_MATS, SIDE_MATS, STRIPE_CONCEPTS } from './data';
const parse=value=>/^#[a-f\d]{6}$/i.test(value)?value:null;
const configure=changes=>audiB9Configuration({...DEFAULT_CONFIG,brand:'AUDI',...changes},parse);

test('Standard selects original Comfort geometry without changing order wording',()=>{
  const cfg=Object.freeze({...DEFAULT_CONFIG,brand:'AUDI',wheelStyle:'Standard'});
  const appearance=audiB9Configuration(cfg,parse), parts=audiB9Parts(appearance);
  expect(appearance.style).toBe('Comfort');expect(parts.top).toBe(3);expect(parts.side).toBe(5);expect(parts.visible.has(17)).toBe(false);expect(cfg.wheelStyle).toBe('Standard');
});
test('every existing style/material combination selects one body and one grip',()=>{
  const bodies=[0,1,2,3,4,14,15,16,17,18],grips=[5,6,7,8,9,33,36,37];
  for(const wheelStyle of ['Standard','Sport'])for(const top of TOP_BOTTOM_MATS)for(const side of SIDE_MATS){
    const selected=audiB9Parts(configure({wheelStyle,topBottomMat:top.n,sideMat:side.n}));
    expect(bodies.filter(n=>selected.visible.has(n))).toEqual([selected.top]);expect(grips.filter(n=>selected.visible.has(n))).toEqual([selected.side]);
    expect(selected.top<14).toBe(wheelStyle==='Standard');
  }
});
test('existing palette values remain the values passed to the preview',()=>{
  for(const color of COLORS){
    const a=configure({topBottomCol:color.h,sideCol:color.h,stitchColor:color.h,plasticTrimCol:color.h,innerTrimCol:color.h,airbagCompat:true,airbagCol:color.h,audiLogoCol:color.h});
    expect([a.top.color,a.side.color,a.stitch,a.trim,a.innerTrim,a.airbag.color,a.logo]).toEqual(Array(7).fill(color.h));
  }
});
test('stripe concepts preserve three-band colors and clear the geometry for No Stripe',()=>{
  for(const stripe of STRIPE_CONCEPTS){
    const a=configure({stripeConceptId:stripe.id});expect(a.stripes).toEqual(stripe.stripes);
    expect(audiB9Parts(a).stripe).toBe(stripe.stripes.length?stripe.id==='C-13'?20:19:null);
  }
  expect(audiB9Parts(configure({stripeConceptId:'C-1',stripeCustomColor:'#123456'})).stripe).toBe(19);
});
test('disabled cover options cannot leak stale cover colors or material into preview',()=>{
  const a=configure({airbagCompat:false,airbagMat:'Alcantara',airbagCol:'#ff0000',airbagStitchColor:'#ff0000',audiLogoCol:'#ff0000'});
  expect(audiB9Parts(a).cover).toBe(42);expect(a.coverColorSelected).toBe(false);expect(a.coverStitchSelected).toBe(false);expect(a.logoColorSelected).toBe(false);
});
test('restored carbon/custom selections keep precedence and do not alter pricing fields',()=>{
  const cfg={...DEFAULT_CONFIG,topBottomMat:'Classic Carbon',topBottomCarbonCol:'#6E0000',topBottomCol:'#ffffff',topBottomCustomColor:'#abcdef',innerTrimMatchCarbon:true,airbagUpgrade:true,heated:true,laneAssist:true};
  const before=JSON.stringify(cfg),a=audiB9Configuration(cfg,parse);
  expect(a.top.color).toBe('#abcdef');expect(a.innerCarbon).toBe(true);expect(JSON.stringify(cfg)).toBe(before);
});
test('RS and S use their source meshes and R8 does not leave an RS badge underneath',()=>{
  expect(audiB9Parts(configure({audiBadge:'RS'})).badge).toBe(22);expect(audiB9Parts(configure({audiBadge:'S'})).badge).toBe(23);
  const r8=audiB9Parts(configure({audiBadge:'R8'}));expect(r8.visible.has(22)).toBe(false);expect(r8.visible.has(23)).toBe(false);
});

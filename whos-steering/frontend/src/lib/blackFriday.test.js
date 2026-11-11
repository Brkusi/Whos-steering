import {blackFridayActive,customWheelPrice} from './blackFriday';
import {currentCartItem} from '../context';
test('Black Friday uses inclusive Nov 11 through Nov 28 in New York',()=>{
 expect(blackFridayActive(Date.parse('2026-11-11T04:59:59Z'))).toBe(false);
 expect(blackFridayActive(Date.parse('2026-11-11T05:00:00Z'))).toBe(true);
 expect(blackFridayActive(Date.parse('2026-11-29T04:59:59Z'))).toBe(true);
 expect(blackFridayActive(Date.parse('2026-11-29T05:00:00Z'))).toBe(false);
});
test('custom discount uses honest originals and exact cent rounding; stock is excluded',()=>{
 const now=Date.parse('2026-11-20T12:00:00Z');
 expect(customWheelPrice(549.99,false,now)).toBe(494.99);
 expect(customWheelPrice(399.99,true,now)).toBe(399.99);
 expect(customWheelPrice(549.99,false,Date.parse('2026-11-29T05:00:00Z'))).toBe(549.99);
});
test('persisted carts reprice airbags and do not compound wheel reductions',()=>{
 const airbag=currentCartItem({price:169.99,config:{productType:'airbag-cover',infinitiLogoFinish:'LED'}});
 expect(airbag.price).toBe(239.98);
 const wheel={price:549.99,config:{brand:'BMW'}};
 expect(currentCartItem(currentCartItem(wheel))).toEqual(currentCartItem(wheel));
 const stock={price:399.99,config:{brand:'BMW',isPreset:true,readyToShip:true}};
 expect(currentCartItem(stock)).toEqual(stock);
});

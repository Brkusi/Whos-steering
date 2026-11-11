import { blackFridayActive, customWheelPrice } from '../lib/blackFriday';
import './BlackFriday.css';
export function WheelDiscountTag({readyToShip=false}) { return blackFridayActive() && !readyToShip ? <span className="bf-wheel-tag">10% OFF · BLACK FRIDAY</span> : null; }
export function WheelPrice({regular,readyToShip=false}) { const price=customWheelPrice(regular,readyToShip);return <>{price!==regular && <del className="bf-original">${regular.toFixed(2)}</del>} ${price.toFixed(2)}</>; }
export function AirbagSpecial() { return <div className="infiniti-sale">{blackFridayActive() && <><span>BLACK FRIDAY SPECIAL</span><del aria-label="Original base price">$249.99</del></>}<strong>From $159.99</strong></div>; }

import { LOGOS } from '../utils.js';
import { useTema } from '../context/ThemeContext.jsx';

export function Logo({ className = 'isotipo' }) {
  const { tema } = useTema();
  return <img className={className} src={LOGOS[tema] || LOGOS.hunyadi} alt="The Fandom House" />;
}

export function Mascota() {
  return <img className="mascota" src="./assets/bolt.png" alt="Bolt, la mascota de The Fandom House" />;
}

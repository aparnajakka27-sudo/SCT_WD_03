import fs from 'fs';
import path from 'path';

const avatarsDir = path.join(process.cwd(), 'public', 'assets', 'avatars');
fs.mkdirSync(avatarsDir, { recursive: true });

const avatars = [
  {
    name: 'maya',
    bg: '#FFD166',
    hairColor: '#2A9D8F',
    hairPath: 'M 20 60 Q 50 5 80 60 Z',
    skin: '#FFE8D6'
  },
  {
    name: 'claire',
    bg: '#F4A261',
    hairColor: '#E76F51',
    hairPath: 'M 25 60 C 25 20, 75 20, 75 60 Z',
    skin: '#FFEDD8'
  },
  {
    name: 'evan',
    bg: '#2A9D8F',
    hairColor: '#264653',
    hairPath: 'M 30 50 Q 50 15 70 50 Z',
    skin: '#FFE0C2'
  },
  {
    name: 'riya',
    bg: '#E9C46A',
    hairColor: '#264653',
    hairPath: 'M 20 50 Q 50 -10 80 50 Z',
    skin: '#DDB892'
  },
  {
    name: 'noah',
    bg: '#8AB17D',
    hairColor: '#D4A373',
    hairPath: 'M 30 55 C 30 25, 70 25, 70 55 Z',
    skin: '#FAEDCD'
  },
  {
    name: 'sam',
    bg: '#E76F51',
    hairColor: '#F4A261',
    hairPath: 'M 25 65 Q 50 20 75 65 Z',
    skin: '#FFD7BA'
  }
];

avatars.forEach(avatar => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="50" fill="${avatar.bg}"/>
  <path d="${avatar.hairPath}" fill="${avatar.hairColor}"/>
  <circle cx="50" cy="65" r="28" fill="${avatar.skin}"/>
  <!-- Eyes -->
  <circle cx="40" cy="60" r="3.5" fill="#264653"/>
  <circle cx="60" cy="60" r="3.5" fill="#264653"/>
  <!-- Smile -->
  <path d="M 43 72 Q 50 78 57 72" stroke="#264653" stroke-width="3" fill="none" stroke-linecap="round"/>
</svg>`;
  fs.writeFileSync(path.join(avatarsDir, `${avatar.name}.svg`), svg);
});
console.log('Avatars generated.');

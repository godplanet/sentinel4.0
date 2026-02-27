export const TURKISH_MALE_NAMES = [
  'Ahmet', 'Mehmet', 'Mustafa', 'Ali', 'Hasan', 'Hüseyin', 'İbrahim', 'Ömer', 'Yusuf', 'Murat',
  'Emre', 'Burak', 'Serkan', 'Kemal', 'Selim', 'Cem', 'Oğuz', 'Bora', 'Eren', 'Kaan',
  'Furkan', 'Barış', 'Deniz', 'Onur', 'Arda', 'Efe', 'Can', 'Emir', 'Özkr', 'Volkan'
];

export const TURKISH_FEMALE_NAMES = [
  'Ayşe', 'Fatma', 'Emine', 'Hatice', 'Zeynep', 'Elif', 'Merve', 'Selin', 'Esra', 'Melis',
  'Deniz', 'Burcu', 'Sibel', 'Gül', 'Pınar', 'Ebru', 'Canan', 'Sevgi', 'Nur', 'Aslı',
  'Derya', 'Tuğçe', 'Gizem', 'İrem', 'Yasemin', 'Ece', 'Seda', 'Zehra', 'Cansu', 'Özge'
];

export const TURKISH_SURNAMES = [
  'Yılmaz', 'Kaya', 'Demir', 'Şahin', 'Çelik', 'Yıldız', 'Aydın', 'Arslan', 'Doğan', 'Kılıç',
  'Aslan', 'Çetin', 'Kara', 'Koç', 'Kurt', 'Özdemir', 'Erdoğan', 'Güneş', 'Aksoy', 'Polat',
  'Öztürk', 'Özcan', 'Karataş', 'Yavuz', 'Şimşek', 'Özkan', 'Güler', 'Korkmaz', 'Türk', 'Acar',
  'Aktaş', 'Bulut', 'Bozkurt', 'Ünal', 'Duman', 'Çakır', 'Tunç', 'Bayram', 'Taş', 'Durmaz'
];

export function getRandomTurkishName(gender: 'male' | 'female' | 'random' = 'random'): string {
  const genderChoice = gender === 'random' ? (Math.random() > 0.5 ? 'male' : 'female') : gender;
  const firstName = genderChoice === 'male'
    ? TURKISH_MALE_NAMES[Math.floor(Math.random() * TURKISH_MALE_NAMES.length)]
    : TURKISH_FEMALE_NAMES[Math.floor(Math.random() * TURKISH_FEMALE_NAMES.length)];
  const surname = TURKISH_SURNAMES[Math.floor(Math.random() * TURKISH_SURNAMES.length)];
  return `${firstName} ${surname}`;
}

export function getRandomEmail(name: string): string {
  const slug = name.toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/\s+/g, '.');
  return `${slug}@sentinelbank.com.tr`;
}

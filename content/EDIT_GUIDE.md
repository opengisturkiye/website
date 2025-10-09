# İçerik Düzenleme Rehberi

## Hızlı Düzenleme

### Yeni Etkinlik Eklemek

1. `content/events/events.json` dosyasını açın
2. En son etkinlikten sonra virgül koyup yeni etkinlik ekleyin:

```json
{
  "id": 4,
  "title": "Yeni Etkinlik",
  "description": "Etkinlik açıklaması",
  "badge": "WORKSHOP",
  "date": "2024-12-01",
  "details": [
    {"label": "Tarih", "value": "1 Aralık 2024"},
    {"label": "Saat", "value": "10:00 - 17:00"},
    {"label": "Format", "value": "Online"},
    {"label": "Katılım", "value": "Ücretsiz"}
  ]
}
```

### Yeni Eğitim Modülü Eklemek

1. `content/education/education.json` dosyasını açın
2. Yeni kurs ekleyin:

```json
{
  "id": 5,
  "title": "Yeni Kurs",
  "subtitle": "Kurs alt başlığı",
  "icon": "N",
  "description": "Kurs açıklaması",
  "modules": [
    "Modül 1",
    "Modül 2",
    "Modül 3"
  ]
}
```

### Yeni Proje Eklemek

1. `content/projects/projects.json` dosyasını açın
2. Yeni proje ekleyin:

```json
{
  "id": 7,
  "title": "Yeni Proje",
  "icon": "⚡",
  "description": "Proje açıklaması",
  "github": "https://github.com/user/new-project",
  "demo": "https://demo.example.com",
  "contributors": 5
}
```

### Yeni Kaynak Eklemek

1. `content/resources/resources.json` dosyasını açın
2. Yeni kaynak ekleyin:

```json
{
  "id": 7,
  "title": "Yeni Kaynak",
  "icon": "📝",
  "description": "Kaynak açıklaması",
  "link": "https://example.com",
  "linkText": "Kaynağa Git",
  "category": "documentation"
}
```

## Renk Değiştirme

`assets/css/variables.css` dosyasında renkleri değiştirin:

```css
:root {
    --primary-green: #2d6a4f;    /* Ana yeşil renk */
    --turquoise: #06d6a0;        /* Turkuaz renk */
    --orange: #f77f00;           /* Turuncu renk */
    --dark: #1b263b;             /* Koyu renk */
    --light: #f8f9fa;            /* Açık renk */
    --gray: #6c757d;             /* Gri renk */
}
```

## Yeni Bölüm Ekleme

1. Yeni CSS dosyası oluşturun: `assets/css/yeni-bolum.css`
2. HTML'e CSS linkini ekleyin
3. HTML'de yeni bölüm ekleyin
4. JavaScript'te render fonksiyonu ekleyin
5. JSON veri dosyası oluşturun

## İpuçları

- JSON dosyalarında son öğeden sonra virgül koymayın
- Emoji ikonları için: 🗺️ 📚 🎥 💻 🔧 📊 📱 ⚡ 🌐
- Tarih formatı: "YYYY-MM-DD"
- ID'leri benzersiz tutun
- Değişikliklerden sonra sayfayı yenileyin
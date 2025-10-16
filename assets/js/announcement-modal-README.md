# Announcement Modal Kullanım Kılavuzu

## 📋 Genel Bakış

Bu modül, siteye ilk kez gelen ziyaretçilere önemli duyuruları göstermek için kullanılan bir popup/modal sistemidir.

## 🎯 Özellikler

- **Otomatik Gösterim**: Sayfa yüklendiğinde otomatik olarak açılır
- **LocalStorage Entegrasyonu**: Kullanıcı bir kez gördüğünde tekrar gösterilmez
- **Responsive Tasarım**: Mobil ve masaüstü uyumlu
- **Modüler Yapı**: Kolay entegrasyon ve özelleştirme
- **Debug Modu**: Console log'ları ile sorun tespiti

## 📁 Dosya Yapısı

```
assets/
├── css/
│   └── announcement-modal.css    # Modal stilleri
├── js/
│   └── announcement-modal.js     # Modal mantığı
└── images/
    └── (modal için resimler)

atolye/
└── katilimcilar.html             # Katılımcılar sayfası
```

## 🚀 Kullanım

### HTML'e Ekleme

```html
<!-- CSS -->
<link rel="stylesheet" href="assets/css/announcement-modal.css">

<!-- Modal HTML (body içinde, en üstte) -->
<div id="announcementModal" class="announcement-modal">
    <div class="modal-content">
        <span class="close-modal">&times;</span>
        <div class="modal-header">
            <div class="modal-icon">🎓</div>
            <h2>Başlık</h2>
            <p>Alt başlık</p>
        </div>
        <div class="modal-body">
            <p>İçerik metni</p>
            <div class="modal-buttons">
                <a href="#" class="modal-btn modal-btn-primary">Birincil Buton</a>
                <button class="modal-btn modal-btn-secondary">Kapat</button>
            </div>
        </div>
    </div>
</div>

<!-- JavaScript (body sonunda) -->
<script src="assets/js/announcement-modal.js"></script>
```

## ⚙️ Yapılandırma

`announcement-modal.js` dosyasındaki `MODAL_CONFIG` nesnesini düzenleyebilirsiniz:

```javascript
const MODAL_CONFIG = {
    id: 'announcementModal',              // Modal ID'si
    storageKey: 'hasSeenAtolyeAnnouncement', // LocalStorage anahtarı
    showDelay: 500                         // Gösterim gecikmesi (ms)
};
```

## 🎨 Özelleştirme

### Renk Teması Değiştirme

`announcement-modal.css` dosyasında:

```css
.modal-content {
    background: linear-gradient(135deg, #4A6F55 0%, #66CDAA 100%);
}

.modal-header h2 {
    color: #4A6F55;
}

.modal-header p {
    color: #66CDAA;
}
```

### Gösterim Süresini Ayarlama

```javascript
showDelay: 500  // 0.5 saniye
showDelay: 1000 // 1 saniye
showDelay: 2000 // 2 saniye
```

## 🔧 JavaScript API

Modal modülü global `AnnouncementModal` objesi sağlar:

```javascript
// Modal'ı göster
AnnouncementModal.show();

// Modal'ı kapat
AnnouncementModal.close();

// Modal'ı sıfırla (test için)
AnnouncementModal.reset();
```

## 🐛 Debug / Test

### Console'da Test Etme

```javascript
// Modal'ın tekrar görünmesi için sıfırla
AnnouncementModal.reset();

// Sayfayı yenile
location.reload();

// Veya direkt göster
AnnouncementModal.show();
```

### LocalStorage Kontrolü

```javascript
// Durumu kontrol et
console.log(localStorage.getItem('hasSeenAtolyeAnnouncement'));

// Manuel sıfırla
localStorage.removeItem('hasSeenAtolyeAnnouncement');

// Tüm localStorage'ı temizle
localStorage.clear();
```

## 📱 Responsive Breakpoint'ler

```css
@media (max-width: 768px) {
    /* Tablet ve mobil için */
}

@media (max-width: 480px) {
    /* Sadece mobil için */
}
```

## ✅ Checklist (Sorun Giderme)

Modal çalışmıyorsa kontrol edin:

- [ ] CSS dosyası yükleniyor mu? (Network tab'da kontrol edin)
- [ ] JavaScript dosyası yükleniyor mu?
- [ ] Modal HTML elementi sayfada var mı? (`id="announcementModal"`)
- [ ] LocalStorage'da `hasSeenAtolyeAnnouncement` değeri `true` mu?
- [ ] Console'da hata var mı?
- [ ] Modal CSS'de `display: none` durumunda mı?

## 🔄 Güncelleme Notları

**v1.0** (16 Ekim 2025)
- İlk modüler versiyon
- Debug log'ları eklendi
- Public API eklendi
- LocalStorage entegrasyonu

## 💡 İpuçları

1. **Yeni Duyuru İçin**: `storageKey` değerini değiştirin
2. **Test İçin**: Console'da `AnnouncementModal.reset()` kullanın
3. **Sürekli Gösterim**: LocalStorage kontrolünü kaldırın
4. **Farklı Sayfalar**: Her sayfa için farklı `storageKey` kullanın

## 📞 Destek

Sorun yaşarsanız:
1. Browser console'u açın (F12)
2. Debug log'larını kontrol edin
3. Network tab'da dosya yüklenmelerini kontrol edin
4. LocalStorage'ı temizleyip tekrar deneyin

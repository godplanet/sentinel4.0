# SENTINEL v3.0: MASTER MODULE HIERARCHY

## 📐 TASARIM SİSTEMİ ANAYASASI
**KRITIK: Tüm sayfa ve component'ler aşağıdaki tasarım anayasasına uymalıdır.**

👉 **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - Detaylı Tasarım Dokümantasyonu**

### Zorunlu Standartlar:
1. **PageHeader**: İkon + ViewControls + Action pattern (tüm sayfalarda)
2. **Glass Effects**: `.glass-card` ve `.glass-panel` kullanımı
3. **Neon Hovers**: Kartlarda `.neon-border-*` efektleri
4. **Vibrant Colors**: Gradients ve canlı renkler (beyaz değil!)
5. **View Toggles**: Liste/Grid/Kanban geçişleri
6. **VDI Mode**: Performans optimizasyonu desteği

---

## 1. GÖZETİM & İCRA (Front Office)
* **Kokpit (Dashboard):** Real-time monitoring of risks and open findings.
* **Denetim Evreni:** The inventory of all auditable entities.
* **Strateji & Hedefler:** Corporate goals alignment.
* **Planlama:** Gantt charts and resource scheduling.
* **Denetim İcrası:** The workspace for active audits.
* **Raporlama:** BI Analytics and Executive summaries.

## 2. YÖNETİM & AYARLAR (Back Office)
* **Risk Parametreleri:** Configure the math engine (`weights`, `thresholds`).
* **Metodoloji:** Define grading scales (A-F, 1-5).
* **Şablon Yöneticisi:** Design custom audit forms.
* **Kullanıcı & Yetki:** RBAC management.
* **Sistem İzleme:** QAIP logs and API health.

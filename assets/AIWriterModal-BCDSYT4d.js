import{r as u,j as e,ah as x,X as y,J as n,q as a,L as v,C as p}from"./index-CySU8kiC.js";const f=[{id:"executive",label:"Yönetici Özeti",description:"Kısa ve öz yönetici özeti oluştur",icon:n,color:"from-blue-500 to-cyan-500"},{id:"findings",label:"Bulgular Bölümü",description:"Tespit edilen bulguları detaylı açıkla",icon:n,color:"from-orange-500 to-red-500"},{id:"conclusion",label:"Sonuç ve Değerlendirme",description:"Genel sonuç ve değerlendirme yaz",icon:n,color:"from-blue-500 to-cyan-500"},{id:"recommendations",label:"Öneriler",description:"Aksiyon önerileri listesi hazırla",icon:n,color:"from-green-500 to-emerald-500"}];function z({onClose:t,onInsert:r,findingCount:s=0}){const[i,k]=u.useState(null),[o,c]=u.useState(!1),[d,g]=u.useState(""),b=async()=>{if(!i)return;c(!0),await new Promise(m=>setTimeout(m,2e3));const l=j(i,s);g(l),c(!1)},h=()=>{r(d),t()};return e.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm",children:e.jsxs("div",{className:"bg-surface rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col",children:[e.jsxs("div",{className:"flex items-center justify-between p-4 border-b border-slate-200",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center",children:e.jsx(x,{className:"text-white",size:20})}),e.jsxs("div",{children:[e.jsx("h2",{className:"text-2xl font-bold text-primary",children:"AI Yazım Asistanı"}),e.jsx("p",{className:"text-sm text-slate-600",children:"Sentinel AI ile profesyonel rapor bölümleri oluşturun"})]})]}),e.jsx("button",{onClick:t,className:"p-2 hover:bg-slate-100 rounded-lg transition-colors",children:e.jsx(y,{className:"w-6 h-6 text-slate-500"})})]}),e.jsx("div",{className:"flex-1 overflow-y-auto p-4",children:d?e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"flex items-center gap-2 mb-4",children:[e.jsx(p,{className:"text-emerald-500",size:24}),e.jsx("h3",{className:"text-lg font-semibold text-primary",children:"İçerik Hazır!"})]}),e.jsx("div",{className:"border border-slate-200 rounded-xl p-4 bg-canvas max-h-96 overflow-y-auto",children:e.jsx("div",{className:"prose prose-slate max-w-none",dangerouslySetInnerHTML:{__html:d}})}),e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsxs("button",{onClick:h,className:"flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all",children:[e.jsx(p,{size:20}),"Rapora Ekle"]}),e.jsx("button",{onClick:()=>g(""),className:"px-4 py-3 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 transition-colors",children:"Yeniden Oluştur"})]})]}):e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"mb-3",children:[e.jsxs("div",{className:"flex items-center gap-2 mb-3",children:[e.jsx("h3",{className:"text-lg font-semibold text-primary",children:"Hangi bölümü yazayım?"}),s>0&&e.jsxs("span",{className:"px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded",children:[s," Bulgu Tespit Edildi"]})]}),e.jsx("p",{className:"text-sm text-slate-600",children:"Bulgularınızı analiz edip profesyonel Türkçe metin oluşturacağım"})]}),e.jsx("div",{className:"grid grid-cols-2 gap-4 mb-3",children:(f||[]).map(l=>{const m=l.icon;return e.jsxs("button",{onClick:()=>k(l.id),className:a("text-left border-2 rounded-xl p-5 transition-all group relative overflow-hidden",i===l.id?"border-blue-500 bg-blue-50":"border-slate-200 hover:border-blue-300 hover:bg-canvas"),children:[e.jsx("div",{className:a("absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-0 transition-opacity",i===l.id&&"opacity-20",`bg-gradient-to-br ${l.color}`)}),e.jsxs("div",{className:"relative",children:[e.jsxs("div",{className:"flex items-center gap-3 mb-2",children:[e.jsx("div",{className:a("w-10 h-10 rounded-lg flex items-center justify-center transition-all",i===l.id?`bg-gradient-to-br ${l.color}`:"bg-slate-100 group-hover:bg-slate-200"),children:e.jsx(m,{className:a("transition-colors",i===l.id?"text-white":"text-slate-600"),size:20})}),e.jsx("h4",{className:"font-semibold text-primary",children:l.label})]}),e.jsx("p",{className:"text-sm text-slate-600",children:l.description})]})]},l.id)})}),e.jsx("button",{onClick:b,disabled:!i||o,className:a("w-full flex items-center justify-center gap-3 px-4 py-4 rounded-xl font-semibold transition-all",i&&!o?"bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg hover:scale-[1.02]":"bg-slate-200 text-slate-400 cursor-not-allowed"),children:o?e.jsxs(e.Fragment,{children:[e.jsx(v,{className:"animate-spin",size:20}),"AI Oluşturuyor..."]}):e.jsxs(e.Fragment,{children:[e.jsx(x,{size:20}),"AI ile Oluştur"]})})]})})]})})}function j(t,r){return{executive:`
 <h2>Yönetici Özeti</h2>
 <p>
 Yapılan denetim çalışmasında, özellikli süreçlerde <strong>${r} adet</strong> bulgu tespit edilmiştir.
 Tespit edilen bulgular, operasyonel risk seviyesinin orta-yüksek düzeyde olduğunu göstermektedir.
 </p>
 <p>
 Bulgular içerisinde <strong>kritik</strong> ve <strong>yüksek</strong> öneme sahip olanların
 acilen çözüme kavuşturulması gerekmektedir. Bu bulgulara ilişkin aksiyon planları oluşturulmuş ve
 ilgili birimlere iletilmiştir.
 </p>
 <p>
 Denetim çalışması sonucunda, mevcut kontrol yapısının güçlendirilmesi ve süreçlerin
 iyileştirilmesine yönelik somut öneriler geliştirilmiştir.
 </p>
 `,findings:`
 <h2>Tespit Edilen Bulgular</h2>
 <p>
 Denetim kapsamında gerçekleştirilen incelemeler neticesinde <strong>${r} adet</strong>
 bulgu tespit edilmiştir. Bu bulgular risk seviyelerine göre sınıflandırılmış ve detaylı olarak
 değerlendirilmiştir.
 </p>
 <h3>Bulgulara Genel Bakış</h3>
 <ul>
 <li><strong>Kritik Bulgular:</strong> Acil müdahale gerektiren, işletme sürekliliğini tehdit eden bulgular</li>
 <li><strong>Yüksek Riskli Bulgular:</strong> Önemli ölçüde risk oluşturan, orta vadede çözüm gerektiren bulgular</li>
 <li><strong>Orta Riskli Bulgular:</strong> İyileştirme fırsatı sunan, takip edilmesi gereken bulgular</li>
 </ul>
 <p>
 Her bir bulgu için detaylı açıklamalar, risk değerlendirmeleri ve kök neden analizleri
 aşağıdaki bölümlerde sunulmaktadır.
 </p>
 `,conclusion:`
 <h2>Sonuç ve Genel Değerlendirme</h2>
 <p>
 Gerçekleştirilen denetim çalışması sonucunda, incelenen süreçlerde <strong>${r} adet</strong>
 gelişim alanı tespit edilmiştir. Bu bulgular, kurumun mevcut risk profilini ve kontrol ortamını
 objektif olarak yansıtmaktadır.
 </p>
 <p>
 Tespit edilen bulguların büyük bir kısmı, süreç iyileştirmeleri ve kontrol mekanizmalarının
 güçlendirilmesi yoluyla giderilebilir niteliktedir. Kritik öneme sahip bulgular için acil
 aksiyon planları oluşturulmuş ve yönetimin onayına sunulmuştur.
 </p>
 <p>
 Genel olarak değerlendirildiğinde, kurumun risk yönetimi ve iç kontrol yapısının temel
 unsurlarının mevcut olduğu ancak etkinliğinin artırılmasına ihtiyaç duyulduğu görülmektedir.
 </p>
 `,recommendations:`
 <h2>Öneriler ve Aksiyon Planı</h2>
 <p>
 Tespit edilen <strong>${r} bulgu</strong> kapsamında aşağıdaki öneriler geliştirilmiştir:
 </p>
 <h3>Kısa Vadeli Öneriler (0-3 Ay)</h3>
 <ul>
 <li>Kritik bulguların acil olarak giderilmesi için kaynak tahsisi yapılmalıdır</li>
 <li>Yüksek riskli alanlarda görev tanımları netleştirilmeli ve sorumluluklar belirlenmelidir</li>
 <li>Günlük operasyonel kontroller güçlendirilmeli ve dokümante edilmelidir</li>
 </ul>
 <h3>Orta Vadeli Öneriler (3-6 Ay)</h3>
 <ul>
 <li>Süreç iyileştirme çalışmaları başlatılmalı ve metodolojik olarak yönetilmelidir</li>
 <li>Personel eğitim programları gözden geçirilmeli ve güncellenmeli</li>
 <li>Teknolojik altyapı yatırımları planlanmalı ve bütçelenmelidir</li>
 </ul>
 <h3>Uzun Vadeli Öneriler (6-12 Ay)</h3>
 <ul>
 <li>Kurumsal risk yönetimi çerçevesi tam olarak uygulanmalı</li>
 <li>Sürekli iyileştirme kültürü kurumsallaştırılmalı</li>
 <li>Denetim döngüsü düzenli olarak tekrarlanarak iyileştirmeler takip edilmelidir</li>
 </ul>
 `}[t]||"<p>İçerik oluşturulamadı</p>"}export{z as AIWriterModal};

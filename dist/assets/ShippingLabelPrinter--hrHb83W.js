import{a as e}from"./rolldown-runtime-B0Z9INg1.js";import{i as t,r as n}from"./vendor-animations-C6iVO7UL.js";import{r}from"./vendor-i18n-MGfu-2_Y.js";import{Ei as i,Et as a,Qi as o,Tt as s,ot as c}from"./vendor-icons-DImrJ8Og.js";import{n as l}from"./dist-BvEIXadt.js";import{n as u}from"./format-DDuWPGN1.js";var d=e(t(),1);function f(e){let{t}=r(),n=(0,d.useRef)(null),[i,a]=(0,d.useState)(`a6`),[o,s]=(0,d.useState)(!0),[c,u]=(0,d.useState)(`Veuillez appeler le client avant livraison. Ouverture de colis autorisée.`),f=e.trackingId||e.trackingNumber||t(`Non attribué`);return{labelSize:i,setLabelSize:a,includeBarcodes:o,setIncludeBarcodes:s,remarks:c,setRemarks:u,actualTracking:f,formats:[{id:`a6`,label:`Autocollant Thermique A6`},{id:`receipt`,label:`Ticket Caisse (80mm)`}],handlePrint:()=>{let e=n.current?.innerHTML;if(!e)return;let t=document.getElementById(`print-iframe-stealth`);t||(t=document.createElement(`iframe`),t.id=`print-iframe-stealth`,t.style.position=`absolute`,t.style.width=`0px`,t.style.height=`0px`,t.style.border=`none`,t.style.left=`-1000px`,t.style.top=`-1000px`,document.body.appendChild(t));let r=t.contentWindow?.document||t.contentDocument;if(!r){l.error(`Erreur d'accès à l'iframe d'impression`);return}r.open(),r.write(`
      <html>
        <head>
          <title>Bordereau d'Expédition - ${f}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Libre+Barcode+128&display=swap');
            
            @page {
              size: ${i===`a6`?`105mm 148mm`:`80mm 200mm`};
              margin: 0;
            }
            body {
              font-family: 'Inter', sans-serif;
              margin: 0;
              padding: 10px;
              color: #000;
              background: #fff;
              -webkit-print-color-adjust: exact;
            }
            .label-card {
              width: 100%;
              max-width: ${i===`a6`?`101mm`:`76mm`};
              margin: 0 auto;
              border: 2px solid #000;
              padding: 10px;
              box-sizing: border-box;
            }
            .header-bar {
              display: flex;
              align-items: center;
              justify-content: space-between;
              border-bottom: 2px solid #000;
              padding-bottom: 8px;
              margin-bottom: 8px;
            }
            .header-bar h2 {
              margin: 0;
              font-size: 16px;
              font-weight: 950;
              text-transform: uppercase;
            }
            .row-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px;
              border-bottom: 1px solid #000;
              padding-bottom: 8px;
              margin-bottom: 8px;
            }
            .full-width {
              border-bottom: 1px solid #000;
              padding-bottom: 8px;
              margin-bottom: 8px;
            }
            .label-text {
              font-size: 8px;
              text-transform: uppercase;
              font-weight: 700;
              color: #555;
            }
            .val-text {
              font-size: 11px;
              font-weight: 700;
            }
            .big-val {
              font-size: 13px;
              font-weight: 900;
              text-transform: uppercase;
            }
            .cash-badge {
              border: 3px solid #000;
              padding: 8px;
              text-align: center;
              background-color: #000;
              color: #fff;
              margin: 8px 0;
            }
            .cash-badge .amount {
              font-size: 20px;
              font-weight: 900;
            }
            .barcode-visual {
              text-align: center;
              padding: 10px 0;
              font-family: 'Libre Barcode 128', sans-serif;
              font-size: 40px;
              line-height: 1;
              letter-spacing: 2px;
            }
            .tracking-code {
              text-align: center;
              font-size: 11px;
              font-weight: 900;
              margin-top: 4px;
            }
            .qr-placeholder {
              width: 50px;
              height: 50px;
              border: 1px solid #000;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 8px;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          ${e}
        </body>
      </html>
    `),r.close();let a=t;setTimeout(()=>{a.contentWindow&&(a.contentWindow.focus(),a.contentWindow.print())},300)},printAreaRef:n}}var p=n(),m=({onClose:e,onPrint:t})=>{let{t:n}=r();return(0,p.jsxs)(`div`,{className:`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5`,children:[(0,p.jsxs)(`div`,{className:`flex items-center gap-3`,children:[(0,p.jsx)(`button`,{onClick:e,className:`p-2 bg-white border border-zinc-200 hover:border-zinc-300 rounded-xl text-zinc-500 transition-colors cursor-pointer`,children:(0,p.jsx)(o,{className:`w-4 h-4`})}),(0,p.jsxs)(`div`,{children:[(0,p.jsx)(`h2`,{className:`text-xl font-sans font-bold text-[var(--color-slate-900, #0f172a)] uppercase tracking-tight rtl:tracking-normal`,children:n(`Bordereaux de Transport National`)}),(0,p.jsx)(`p`,{className:`text-xs rtl:text-sm text-zinc-400 font-bold`,children:n(`Configurez et imprimez des tickets de vente compatibles Mayestro ou Standard Olmart.`)})]})]}),(0,p.jsxs)(`button`,{onClick:t,className:`px-6 py-3 bg-[#ea580c] hover:bg-[#c2410c] text-white font-sans font-bold text-xs rtl:text-sm uppercase tracking-widest rtl:tracking-normal rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer border-none shadow-md hover:shadow-lg`,children:[(0,p.jsx)(a,{className:`w-4 h-4`}),n(`Lancer l'impression`)]})]})},h=({labelSize:e,setLabelSize:t,remarks:n,setRemarks:a,includeBarcodes:o,setIncludeBarcodes:s,formats:l})=>{let{t:u}=r();return(0,p.jsxs)(`div`,{className:`lg:col-span-5 space-y-6`,children:[(0,p.jsxs)(`div`,{className:`bg-white rounded-3xl p-6 border border-zinc-100 shadow-sm space-y-5`,children:[(0,p.jsxs)(`h3`,{className:`text-xs rtl:text-sm font-sans font-bold text-[var(--color-slate-900, #0f172a)] uppercase tracking-widest rtl:tracking-normal flex items-center gap-1`,children:[(0,p.jsx)(c,{className:`w-4 h-4 text-[var(--color-orange-600, #ea580c)]`}),u(`Format & Paramètres`)]}),(0,p.jsxs)(`div`,{className:`space-y-2`,children:[(0,p.jsx)(`label`,{className:`block text-[10px] rtl:text-[12px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal`,children:u(`Format du Bordereau`)}),(0,p.jsx)(`div`,{className:`grid grid-cols-2 gap-2`,children:l.map(n=>(0,p.jsx)(`button`,{onClick:()=>t(n.id),className:`py-2 px-2 rounded-xl text-[10px] rtl:text-[12px] font-black uppercase tracking-wider rtl:tracking-normal transition-all border cursor-pointer ${e===n.id?`bg-slate-900 text-white border-transparent`:`bg-zinc-50 text-zinc-500 border-zinc-200 hover:bg-zinc-100`}`,children:n.label},n.id))})]}),(0,p.jsxs)(`div`,{className:`space-y-2`,children:[(0,p.jsx)(`label`,{className:`block text-[10px] rtl:text-[12px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal`,children:u(`Instructions de livraison (Bordereau Vendeur)`)}),(0,p.jsx)(`textarea`,{value:n,onChange:e=>a(e.target.value),rows:3,placeholder:u(`Ex: Appeler avant d'arriver...`)||`Ex: Appeler avant d'arriver...`,className:`w-full text-xs rtl:text-sm font-semibold p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-[var(--color-orange-600, #ea580c)] outline-none`})]}),(0,p.jsxs)(`div`,{className:`flex items-center justify-between pt-2`,children:[(0,p.jsx)(`span`,{className:`text-xs rtl:text-sm font-bold text-zinc-600`,children:u(`Imprimer les Codes Barres & QR`)}),(0,p.jsx)(`button`,{onClick:()=>s(!o),className:`w-11 h-6 rounded-full transition-all relative ${o?`bg-[#ea580c]`:`bg-zinc-200`}`,children:(0,p.jsx)(`div`,{className:`w-4.5 h-4.5 rounded-full bg-white absolute top-0.75 transition-all ${o?`right-1`:`left-1`}`})})]})]}),(0,p.jsxs)(`div`,{className:`bg-slate-900 text-white rounded-3xl p-6 shadow-md space-y-4`,children:[(0,p.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,p.jsx)(i,{className:`w-4 h-4 text-orange-400`}),(0,p.jsx)(`h4`,{className:`text-xs rtl:text-sm font-sans font-bold uppercase tracking-widest rtl:tracking-normal text-[#FAF8F5]`,children:u(`Livraison Directe Vendeur`)})]}),(0,p.jsx)(`p`,{className:`text-[11px] text-zinc-300 leading-relaxed font-semibold`,children:u(`Vous gérez directement l'expédition et la livraison de ce colis aux clients. Imprimez ce bordereau officiel pour accompagner le colis lors de l'acheminement.`)}),(0,p.jsxs)(`div`,{className:`bg-white/10 p-3.5 rounded-2xl flex items-center justify-between`,children:[(0,p.jsxs)(`div`,{children:[(0,p.jsx)(`span`,{className:`block text-[8px] font-sans font-bold uppercase text-zinc-300`,children:u(`Mode de Gestion`)}),(0,p.jsx)(`span`,{className:`text-xs rtl:text-sm font-bold`,children:`Autonome Vendeur Olmart`})]}),(0,p.jsx)(`span`,{className:`px-2.5 py-1 text-[9px] rtl:text-[11px] font-black uppercase tracking-widest rtl:tracking-normal rounded-lg bg-emerald-500 text-white`,children:`ACTIF`})]})]})]})},g=[4,1,3,2,4,1,2,3,4,1,2,4,3,2,4,1,3,2,4,1,4,3,2,1,4,2,3,1,4,2,3,4,1,2,3,4],_=({actualTracking:e})=>(0,p.jsxs)(`div`,{className:`pt-2 text-center space-y-1 select-none`,children:[(0,p.jsx)(`div`,{className:`h-14 bg-white border-2 border-black w-full flex items-center justify-center rounded overflow-hidden py-1`,children:(0,p.jsx)(`div`,{className:`flex gap-0 items-stretch h-full w-full px-6`,children:g.map((e,t)=>(0,p.jsx)(`div`,{style:{flexGrow:e},className:`h-full ${t%2==0?`bg-black`:`bg-white`}`},t))})}),(0,p.jsx)(`strong`,{className:`block text-[12px] font-sans font-bold tracking-[0.2em] text-black`,children:e})]}),v=({order:e,actualTracking:t,includeBarcodes:n,remarks:i,printAreaRef:a})=>{let{t:o}=r();return(0,p.jsxs)(`div`,{className:`lg:col-span-7 flex flex-col items-center`,children:[(0,p.jsx)(`span`,{className:`text-[10px] rtl:text-[12px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal mb-3 select-none`,children:o(`Aperçu conforme du ticket d'expédition (Standard Algérie)`)}),(0,p.jsx)(`div`,{className:`bg-white shadow-2xl p-6 border-2 border-dashed border-zinc-300 rounded-[1.5rem] w-full max-w-[380px]`,id:`print-label-container`,children:(0,p.jsx)(`div`,{className:`bg-white text-zinc-950 text-left select-text`,ref:a,children:(0,p.jsxs)(`div`,{className:`border-[3px] border-zinc-950 p-4 font-mono space-y-4 rounded-xl`,children:[(0,p.jsxs)(`div`,{className:`flex items-center justify-between border-b-2 border-zinc-950 pb-2`,children:[(0,p.jsxs)(`div`,{className:`space-y-0.5`,children:[(0,p.jsx)(`h3`,{className:`text-sm font-sans font-bold uppercase tracking-tighter leading-none`,children:`📦 LIVRAISON DIRECTE VENDEUR`}),(0,p.jsx)(`p`,{className:`text-[9px] rtl:text-[11px] font-bold text-zinc-500`,children:o(`Bordereau Algérie 69 Wilayas`)})]}),n&&(0,p.jsx)(`div`,{className:`w-10 h-10 border border-zinc-950 flex items-center justify-center rounded`,children:(0,p.jsx)(s,{className:`w-8 h-8 text-black`})})]}),(0,p.jsxs)(`div`,{className:`grid grid-cols-2 gap-4 text-[10px] rtl:text-[12px] border-b border-zinc-950 pb-3`,children:[(0,p.jsxs)(`div`,{className:`space-y-1`,children:[(0,p.jsx)(`span`,{className:`block text-[8px] font-sans font-bold text-zinc-500 uppercase tracking-wide`,children:o(`EXPÉDITEUR :`)}),(0,p.jsx)(`strong`,{className:`block text-zinc-900 leading-tight`,children:o(`OLMART DIRECT`)}),(0,p.jsx)(`span`,{className:`block text-zinc-500 font-bold`,children:`+213 23 00 00`})]}),(0,p.jsxs)(`div`,{className:`space-y-1 border-l border-zinc-200 pl-3`,children:[(0,p.jsx)(`span`,{className:`block text-[8px] font-sans font-bold text-zinc-500 uppercase tracking-wide`,children:o(`DESTINATAIRE :`)}),(0,p.jsx)(`strong`,{className:`block text-zinc-900 leading-tight`,children:e.shippingAddress?.name||`Client Olmart`}),(0,p.jsx)(`span`,{className:`block text-zinc-500 font-bold`,children:e.shippingAddress?.phone})]})]}),(0,p.jsxs)(`div`,{className:`space-y-1 border-b border-zinc-950 pb-3`,children:[(0,p.jsx)(`span`,{className:`block text-[8px] font-sans font-bold text-zinc-500 uppercase tracking-wide`,children:o(`ADRESSE DE LIVRAISON`)}),(0,p.jsx)(`p`,{className:`text-[11px] font-sans font-bold text-zinc-950 leading-tight`,children:e.shippingAddress?.street||`Non spécifiée`}),(0,p.jsxs)(`p`,{className:`text-[12px] font-sans font-bold text-zinc-900 uppercase`,children:[`📍 `,e.shippingAddress?.commune||`Commune`,` • `,e.shippingAddress?.wilaya||`Wilaya`]})]}),(0,p.jsxs)(`div`,{className:`space-y-2 text-[10px] rtl:text-[12px] border-b border-zinc-950 pb-3`,children:[(0,p.jsx)(`span`,{className:`block text-[8px] font-sans font-bold text-zinc-500 uppercase tracking-wide`,children:o(`CONTENU COLIS / ARTICLES`)}),(0,p.jsx)(`div`,{className:`space-y-1 font-sans`,children:e.items?.map((e,t)=>(0,p.jsxs)(`p`,{className:`text-xs rtl:text-sm text-zinc-900 font-bold leading-tight`,children:[`• `,e.name,` `,(0,p.jsxs)(`span`,{className:`text-zinc-500 font-normal`,children:[o(`store_profile.qty_x`,`x `),` `,e.quantity||1]})]},t))})]}),(0,p.jsxs)(`div`,{className:`border-[3px] border-zinc-950 p-2 text-center rounded-lg bg-zinc-950 text-white`,children:[(0,p.jsx)(`span`,{className:`block text-[8px] font-sans font-bold tracking-widest rtl:tracking-normal text-[#FAF8F5]/70 uppercase`,children:o(`MONTANT A ENCAISSER DU CLIENT (COD)`)}),(0,p.jsx)(`h4`,{className:`text-xl font-sans font-bold`,children:u(e.total)}),(0,p.jsx)(`p`,{className:`text-[8px] tracking-wide text-zinc-300 uppercase leading-none mt-1`,children:o(`Cash on Delivery - Espèces d'Algérie uniquement`)})]}),n&&(0,p.jsx)(_,{actualTracking:t}),(0,p.jsxs)(`div`,{className:`text-[9px] rtl:text-[11px] text-zinc-500 leading-tight pt-1 font-sans border-t border-zinc-200`,children:[(0,p.jsx)(`strong`,{children:o(`Notes Vendeur :`)}),` `,i]})]})})})]})},y=({order:e,onClose:t})=>{let{labelSize:n,setLabelSize:r,includeBarcodes:i,setIncludeBarcodes:a,remarks:o,setRemarks:s,actualTracking:c,formats:l,handlePrint:u,printAreaRef:d}=f(e);return(0,p.jsxs)(`div`,{className:`bg-zinc-50 border border-zinc-200 rounded-[2.5rem] p-6 sm:p-8 space-y-8`,children:[(0,p.jsx)(m,{onClose:t,onPrint:u}),(0,p.jsxs)(`div`,{className:`grid grid-cols-1 lg:grid-cols-12 gap-8`,children:[(0,p.jsx)(h,{labelSize:n,setLabelSize:r,remarks:o,setRemarks:s,includeBarcodes:i,setIncludeBarcodes:a,formats:l}),(0,p.jsx)(v,{order:e,actualTracking:c,includeBarcodes:i,remarks:o,printAreaRef:d})]})]})};export{y as t};
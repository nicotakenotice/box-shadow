var app=function(){"use strict";function e(){}function t(e){return e()}function n(){return Object.create(null)}function o(e){e.forEach(t)}function s(e){return"function"==typeof e}function i(e,t){return e!=e?t==t:e!==t||e&&"object"==typeof e||"function"==typeof e}let c,l=!1;function r(e,t,n,o){for(;e<t;){const s=e+(t-e>>1);n(s)<=o?e=s+1:t=s}return e}function a(e,t){l?(!function(e){if(e.hydrate_init)return;e.hydrate_init=!0;const t=e.childNodes,n=new Int32Array(t.length+1),o=new Int32Array(t.length);n[0]=-1;let s=0;for(let e=0;e<t.length;e++){const i=r(1,s+1,(e=>t[n[e]].claim_order),t[e].claim_order)-1;o[e]=n[i]+1;const c=i+1;n[c]=e,s=Math.max(c,s)}const i=[],c=[];let l=t.length-1;for(let e=n[s]+1;0!=e;e=o[e-1]){for(i.push(t[e-1]);l>=e;l--)c.push(t[l]);l--}for(;l>=0;l--)c.push(t[l]);i.reverse(),c.sort(((e,t)=>e.claim_order-t.claim_order));for(let t=0,n=0;t<c.length;t++){for(;n<i.length&&c[t].claim_order>=i[n].claim_order;)n++;const o=n<i.length?i[n]:null;e.insertBefore(c[t],o)}}(e),(void 0===e.actual_end_child||null!==e.actual_end_child&&e.actual_end_child.parentElement!==e)&&(e.actual_end_child=e.firstChild),t!==e.actual_end_child?e.insertBefore(t,e.actual_end_child):e.actual_end_child=t.nextSibling):t.parentNode!==e&&e.appendChild(t)}function d(e,t,n){l&&!n?a(e,t):(t.parentNode!==e||n&&t.nextSibling!==n)&&e.insertBefore(t,n||null)}function u(e){e.parentNode.removeChild(e)}function f(e){return document.createElement(e)}function p(e){return document.createTextNode(e)}function h(){return p(" ")}function m(e,t,n,o){return e.addEventListener(t,n,o),()=>e.removeEventListener(t,n,o)}function x(e,t,n){null==n?e.removeAttribute(t):e.getAttribute(t)!==n&&e.setAttribute(t,n)}function v(e){return""===e?null:+e}function b(e,t){t=""+t,e.wholeText!==t&&(e.data=t)}function g(e,t){e.value=null==t?"":t}function w(e,t,n,o){e.style.setProperty(t,n,o?"important":"")}function $(e){c=e}const y=[],_=[],k=[],C=[],z=Promise.resolve();let T=!1;function L(e){k.push(e)}let M=!1;const E=new Set;function H(){if(!M){M=!0;do{for(let e=0;e<y.length;e+=1){const t=y[e];$(t),B(t.$$)}for($(null),y.length=0;_.length;)_.pop()();for(let e=0;e<k.length;e+=1){const t=k[e];E.has(t)||(E.add(t),t())}k.length=0}while(y.length);for(;C.length;)C.pop()();T=!1,M=!1,E.clear()}}function B(e){if(null!==e.fragment){e.update(),o(e.before_update);const t=e.dirty;e.dirty=[-1],e.fragment&&e.fragment.p(e.ctx,t),e.after_update.forEach(L)}}const R=new Set;function S(e,t){e&&e.i&&(R.delete(e),e.i(t))}function A(e,t,n,o){if(e&&e.o){if(R.has(e))return;R.add(e),undefined.c.push((()=>{R.delete(e),o&&(n&&e.d(1),o())})),e.o(t)}}function N(e){e&&e.c()}function I(e,n,i,c){const{fragment:l,on_mount:r,on_destroy:a,after_update:d}=e.$$;l&&l.m(n,i),c||L((()=>{const n=r.map(t).filter(s);a?a.push(...n):o(n),e.$$.on_mount=[]})),d.forEach(L)}function Y(e,t){const n=e.$$;null!==n.fragment&&(o(n.on_destroy),n.fragment&&n.fragment.d(t),n.on_destroy=n.fragment=null,n.ctx=[])}function j(e,t){-1===e.$$.dirty[0]&&(y.push(e),T||(T=!0,z.then(H)),e.$$.dirty.fill(0)),e.$$.dirty[t/31|0]|=1<<t%31}function O(t,s,i,r,a,d,f=[-1]){const p=c;$(t);const h=t.$$={fragment:null,ctx:null,props:d,update:e,not_equal:a,bound:n(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(p?p.$$.context:s.context||[]),callbacks:n(),dirty:f,skip_bound:!1};let m=!1;if(h.ctx=i?i(t,s.props||{},((e,n,...o)=>{const s=o.length?o[0]:n;return h.ctx&&a(h.ctx[e],h.ctx[e]=s)&&(!h.skip_bound&&h.bound[e]&&h.bound[e](s),m&&j(t,e)),n})):[],h.update(),m=!0,o(h.before_update),h.fragment=!!r&&r(h.ctx),s.target){if(s.hydrate){l=!0;const e=function(e){return Array.from(e.childNodes)}(s.target);h.fragment&&h.fragment.l(e),e.forEach(u)}else h.fragment&&h.fragment.c();s.intro&&S(t.$$.fragment),I(t,s.target,s.anchor,s.customElement),l=!1,H()}$(p)}class X{$destroy(){Y(this,1),this.$destroy=e}$on(e,t){const n=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return n.push(t),()=>{const e=n.indexOf(t);-1!==e&&n.splice(e,1)}}$set(e){var t;this.$$set&&(t=e,0!==Object.keys(t).length)&&(this.$$.skip_bound=!0,this.$$set(e),this.$$.skip_bound=!1)}}function P(t){let n;return{c(){n=f("header"),n.innerHTML='<div class="container-fluid d-flex flex-row align-items-center py-3"><div><i class="bi bi-back"></i></div> \n    <div class="ellipsis ms-2">box-shadow</div> \n    <div class="ms-auto"><a href="https://github.com/nicotakenotice/box-shadow" target="_blank"><i class="bi bi-github"></i></a></div></div>',x(n,"class","sticky-top shadow svelte-120ct91")},m(e,t){d(e,n,t)},p:e,i:e,o:e,d(e){e&&u(n)}}}class q extends X{constructor(e){super(),O(this,e,null,P,i,{})}}function D(t){let n,o,s,i,c;return{c(){n=f("footer"),o=p("© "),s=p(t[0]),i=h(),c=f("a"),c.textContent="@nicotakenotice",x(c,"href","https://github.com/nicotakenotice"),x(c,"target","_blank"),x(n,"class","text-center bg-gray py-3")},m(e,t){d(e,n,t),a(n,o),a(n,s),a(n,i),a(n,c)},p:e,i:e,o:e,d(e){e&&u(n)}}}function F(e){return[(new Date).getFullYear()]}class G extends X{constructor(e){super(),O(this,e,F,D,i,{})}}function J(e){let t,n,s,i,c,l,r,v,$,y,_,k,C,z,T,L,M,E,H,B,R,j,O,X,P,D,F,J,K,Q,U,V,W,Z,ee,te,ne,oe,se,ie,ce,le,re,ae,de,ue,fe,pe,he,me,xe,ve,be,ge,we,$e,ye,_e,ke,Ce,ze,Te,Le,Me,Ee,He,Be,Re,Se,Ae,Ne,Ie,Ye,je,Oe,Xe,Pe,qe,De,Fe,Ge,Je,Ke,Qe,Ue,Ve,We,Ze,et,tt,nt,ot,st,it,ct,lt,rt,at,dt,ut,ft,pt,ht,mt,xt,vt,bt,gt,wt,$t,yt,_t,kt,Ct,zt,Tt,Lt,Mt;return n=new q({}),zt=new G({}),{c(){t=f("div"),N(n.$$.fragment),s=h(),i=f("main"),c=f("div"),l=f("div"),r=h(),v=f("div"),$=f("input"),y=h(),_=f("span"),_.textContent="inset",k=h(),C=f("div"),z=f("div"),T=f("div"),L=f("div"),M=f("div"),M.textContent="x-offset",E=h(),H=f("div"),B=p(e[1]),R=h(),j=f("div"),j.innerHTML='<i class="bi bi-arrow-counterclockwise"></i>',O=h(),X=f("div"),P=f("input"),D=h(),F=f("div"),J=f("div"),K=f("div"),K.textContent="y-offset",Q=h(),U=f("div"),V=p(e[2]),W=h(),Z=f("div"),Z.innerHTML='<i class="bi bi-arrow-counterclockwise"></i>',ee=h(),te=f("div"),ne=f("input"),oe=h(),se=f("div"),ie=f("div"),ce=f("div"),ce.textContent="blur",le=h(),re=f("div"),ae=p(e[3]),de=h(),ue=f("div"),ue.innerHTML='<i class="bi bi-arrow-counterclockwise"></i>',fe=h(),pe=f("div"),he=f("input"),me=h(),xe=f("div"),ve=f("div"),be=f("div"),be.textContent="spread",ge=h(),we=f("div"),$e=p(e[4]),ye=h(),_e=f("div"),_e.innerHTML='<i class="bi bi-arrow-counterclockwise"></i>',ke=h(),Ce=f("div"),ze=f("input"),Te=h(),Le=f("div"),Me=f("div"),Ee=f("div"),Ee.textContent="shadow",He=h(),Be=f("div"),Re=p(e[5]),Se=h(),Ae=f("div"),Ae.innerHTML='<i class="bi bi-arrow-counterclockwise"></i>',Ne=h(),Ie=f("div"),Ye=f("input"),je=h(),Oe=f("div"),Xe=f("div"),Pe=f("div"),Pe.textContent="box",qe=h(),De=f("div"),Fe=p(e[6]),Ge=h(),Je=f("div"),Je.innerHTML='<i class="bi bi-arrow-counterclockwise"></i>',Ke=h(),Qe=f("div"),Ue=f("input"),Ve=h(),We=f("div"),Ze=f("div"),et=f("div"),et.textContent="background",tt=h(),nt=f("div"),ot=p(e[7]),st=h(),it=f("div"),it.innerHTML='<i class="bi bi-arrow-counterclockwise"></i>',ct=h(),lt=f("div"),rt=f("input"),at=h(),dt=f("div"),ut=f("pre"),ft=p("#box {\r\n  "),pt=f("span"),pt.textContent="background-color",ht=p(": "),mt=f("span"),xt=p(e[6]),vt=p(";\r\n  "),bt=f("span"),bt.textContent="box-shadow",gt=p(": "),wt=f("span"),$t=p(e[8]),yt=p(";\r\n}"),_t=h(),kt=f("div"),kt.innerHTML='<i class="bi bi-clipboard"></i>',Ct=h(),N(zt.$$.fragment),x(l,"id","box"),x(l,"class","rounded svelte-zoxcra"),w(l,"background-color",e[6]),w(l,"box-shadow",e[8]),x($,"type","checkbox"),x($,"class","form-check-input"),x(_,"class","label"),x(v,"id","inset-box"),x(v,"class","svelte-zoxcra"),x(c,"id","canvas"),x(c,"class","position-relative shadow svelte-zoxcra"),w(c,"background-color",e[7]),x(M,"class","label ellipsis"),x(H,"class","number-box ms-auto svelte-zoxcra"),x(j,"class","reset-icon ms-2 svelte-zoxcra"),x(j,"title","Reset"),x(L,"class","d-flex flex-row align-items-center"),x(P,"type","range"),x(P,"class","form-range"),x(P,"min","-50"),x(P,"max","50"),x(T,"class","col-6 col-md-3"),x(K,"class","label ellipsis"),x(U,"class","number-box ms-auto svelte-zoxcra"),x(Z,"class","reset-icon ms-2 svelte-zoxcra"),x(Z,"title","Reset"),x(J,"class","d-flex flex-row align-items-center"),x(ne,"type","range"),x(ne,"class","form-range"),x(ne,"min","-50"),x(ne,"max","50"),x(F,"class","col-6 col-md-3"),x(ce,"class","label ellipsis"),x(re,"class","number-box ms-auto svelte-zoxcra"),x(ue,"class","reset-icon ms-2 svelte-zoxcra"),x(ue,"title","Reset"),x(ie,"class","d-flex flex-row align-items-center"),x(he,"type","range"),x(he,"class","form-range"),x(he,"min","0"),x(he,"max","50"),x(se,"class","col-6 col-md-3"),x(be,"class","label ellipsis"),x(we,"class","number-box ms-auto svelte-zoxcra"),x(_e,"class","reset-icon ms-2 svelte-zoxcra"),x(_e,"title","Reset"),x(ve,"class","d-flex flex-row align-items-center"),x(ze,"type","range"),x(ze,"class","form-range"),x(ze,"min","-50"),x(ze,"max","50"),x(xe,"class","col-6 col-md-3"),x(Ee,"class","label ellipsis"),x(Be,"class","hex-box ms-auto svelte-zoxcra"),x(Ae,"class","reset-icon ms-2 svelte-zoxcra"),x(Ae,"title","Reset"),x(Me,"class","d-flex flex-row align-items-center"),x(Ye,"type","color"),x(Ye,"class","form-range"),x(Ie,"class","mt-1"),x(Le,"class","col-12 col-sm-4"),x(Pe,"class","label ellipsis"),x(De,"class","hex-box ms-auto svelte-zoxcra"),x(Je,"class","reset-icon ms-2 svelte-zoxcra"),x(Je,"title","Reset"),x(Xe,"class","d-flex flex-row align-items-center"),x(Ue,"type","color"),x(Ue,"class","form-range"),x(Qe,"class","mt-1"),x(Oe,"class","col-12 col-sm-4"),x(et,"class","label ellipsis"),x(nt,"class","hex-box ms-auto svelte-zoxcra"),x(it,"class","reset-icon ms-2 svelte-zoxcra"),x(it,"title","Reset"),x(Ze,"class","d-flex flex-row align-items-center"),x(rt,"type","color"),x(rt,"class","form-range"),x(lt,"class","mt-1"),x(We,"class","col-12 col-sm-4"),x(z,"class","row"),w(pt,"color","var(--bs-purple)"),w(mt,"color","var(--bs-green)"),w(bt,"color","var(--bs-purple)"),w(wt,"color","var(--bs-green)"),x(ut,"id","css-box"),x(ut,"class","mb-0"),x(kt,"id","copy-icon"),x(kt,"title","Copy to clipboard"),x(kt,"class","svelte-zoxcra"),x(dt,"class","position-relative bg-gray rounded p-2 mt-4"),x(C,"class","container-fluid py-4"),x(i,"class","flex-grow-1"),x(t,"class","d-flex flex-column min-vh-100 font-monospace")},m(o,u){d(o,t,u),I(n,t,null),a(t,s),a(t,i),a(i,c),a(c,l),a(c,r),a(c,v),a(v,$),$.checked=e[0],a(v,y),a(v,_),a(i,k),a(i,C),a(C,z),a(z,T),a(T,L),a(L,M),a(L,E),a(L,H),a(H,B),a(L,R),a(L,j),a(T,O),a(T,X),a(X,P),g(P,e[1]),a(z,D),a(z,F),a(F,J),a(J,K),a(J,Q),a(J,U),a(U,V),a(J,W),a(J,Z),a(F,ee),a(F,te),a(te,ne),g(ne,e[2]),a(z,oe),a(z,se),a(se,ie),a(ie,ce),a(ie,le),a(ie,re),a(re,ae),a(ie,de),a(ie,ue),a(se,fe),a(se,pe),a(pe,he),g(he,e[3]),a(z,me),a(z,xe),a(xe,ve),a(ve,be),a(ve,ge),a(ve,we),a(we,$e),a(ve,ye),a(ve,_e),a(xe,ke),a(xe,Ce),a(Ce,ze),g(ze,e[4]),a(z,Te),a(z,Le),a(Le,Me),a(Me,Ee),a(Me,He),a(Me,Be),a(Be,Re),a(Me,Se),a(Me,Ae),a(Le,Ne),a(Le,Ie),a(Ie,Ye),g(Ye,e[5]),a(z,je),a(z,Oe),a(Oe,Xe),a(Xe,Pe),a(Xe,qe),a(Xe,De),a(De,Fe),a(Xe,Ge),a(Xe,Je),a(Oe,Ke),a(Oe,Qe),a(Qe,Ue),g(Ue,e[6]),a(z,Ve),a(z,We),a(We,Ze),a(Ze,et),a(Ze,tt),a(Ze,nt),a(nt,ot),a(Ze,st),a(Ze,it),a(We,ct),a(We,lt),a(lt,rt),g(rt,e[7]),a(C,at),a(C,dt),a(dt,ut),a(ut,ft),a(ut,pt),a(ut,ht),a(ut,mt),a(mt,xt),a(ut,vt),a(ut,bt),a(ut,gt),a(ut,wt),a(wt,$t),a(ut,yt),a(dt,_t),a(dt,kt),a(t,Ct),I(zt,t,null),Tt=!0,Lt||(Mt=[m($,"change",e[10]),m(j,"click",e[11]),m(P,"change",e[12]),m(P,"input",e[12]),m(Z,"click",e[13]),m(ne,"change",e[14]),m(ne,"input",e[14]),m(ue,"click",e[15]),m(he,"change",e[16]),m(he,"input",e[16]),m(_e,"click",e[17]),m(ze,"change",e[18]),m(ze,"input",e[18]),m(Ae,"click",e[19]),m(Ye,"input",e[20]),m(Je,"click",e[21]),m(Ue,"input",e[22]),m(it,"click",e[23]),m(rt,"input",e[24]),m(kt,"click",e[25])],Lt=!0)},p(e,[t]){(!Tt||64&t)&&w(l,"background-color",e[6]),(!Tt||256&t)&&w(l,"box-shadow",e[8]),1&t&&($.checked=e[0]),(!Tt||128&t)&&w(c,"background-color",e[7]),(!Tt||2&t)&&b(B,e[1]),2&t&&g(P,e[1]),(!Tt||4&t)&&b(V,e[2]),4&t&&g(ne,e[2]),(!Tt||8&t)&&b(ae,e[3]),8&t&&g(he,e[3]),(!Tt||16&t)&&b($e,e[4]),16&t&&g(ze,e[4]),(!Tt||32&t)&&b(Re,e[5]),32&t&&g(Ye,e[5]),(!Tt||64&t)&&b(Fe,e[6]),64&t&&g(Ue,e[6]),(!Tt||128&t)&&b(ot,e[7]),128&t&&g(rt,e[7]),(!Tt||64&t)&&b(xt,e[6]),(!Tt||256&t)&&b($t,e[8])},i(e){Tt||(S(n.$$.fragment,e),S(zt.$$.fragment,e),Tt=!0)},o(e){A(n.$$.fragment,e),A(zt.$$.fragment,e),Tt=!1},d(e){e&&u(t),Y(n),Y(zt),Lt=!1,o(Mt)}}}function K(e,t,n){let o;const s={boxColor:"#85b6ff",bgColor:"#ffffff",shadowInset:!1,shadowX:0,shadowY:4,shadowBlur:10,shadowSpread:0,shadowColor:"#8f8f8f"};let i=s.boxColor,c=s.bgColor,l=s.shadowInset,r=s.shadowX,a=s.shadowY,d=s.shadowBlur,u=s.shadowSpread,f=s.shadowColor;return e.$$.update=()=>{63&e.$$.dirty&&n(8,o=`${l?"inset ":""}${r}px ${a}px ${d}px ${u}px ${f}`)},[l,r,a,d,u,f,i,c,o,s,function(){l=this.checked,n(0,l)},()=>n(1,r=s.shadowX),function(){r=v(this.value),n(1,r)},()=>n(2,a=s.shadowY),function(){a=v(this.value),n(2,a)},()=>n(3,d=s.shadowBlur),function(){d=v(this.value),n(3,d)},()=>n(4,u=s.shadowSpread),function(){u=v(this.value),n(4,u)},()=>n(5,f=s.shadowColor),function(){f=this.value,n(5,f)},()=>n(6,i=s.boxColor),function(){i=this.value,n(6,i)},()=>n(7,c=s.bgColor),function(){c=this.value,n(7,c)},()=>function(){const e=document.getElementById("css-box");navigator.clipboard.writeText(e.innerText)}()]}return new class extends X{constructor(e){super(),O(this,e,K,J,i,{})}}({target:document.body})}();
//# sourceMappingURL=bundle.js.map

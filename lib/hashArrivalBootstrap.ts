// Executado no HTML antes da hidratação: preserva a intenção da pessoa
// enquanto os módulos do React e a mídia da página ainda estão carregando.
export const HASH_INPUT_BOOTSTRAP = `(()=>{
  if(location.hash.length<2||location.hash.startsWith('#porta-'))return;
  const events=['wheel','touchstart','keydown','pointerdown'];
  const stop=()=>{
    window.__portfolioHashInput=true;
    events.forEach(event=>window.removeEventListener(event,stop,true));
  };
  events.forEach(event=>window.addEventListener(event,stop,{capture:true,passive:true}));
})();`;

declare global {
  interface Window {
    __portfolioHashInput?: boolean;
  }
}

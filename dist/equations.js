'use strict';
const WarpEquations = (() => {
  const variables = ['r','R','w','v','C'];
  const functions = new Map([
    ['sin',[1,Math.sin]], ['cos',[1,Math.cos]], ['tanh',[1,Math.tanh]],
    ['exp',[1,Math.exp]], ['log',[1,Math.log]], ['sqrt',[1,Math.sqrt]],
    ['abs',[1,Math.abs]], ['min',[2,Math.min]], ['max',[2,Math.max]],
    ['clamp',[3,(x,lo,hi)=>Math.min(hi,Math.max(lo,x))]],
    ['smooth5',[1,x=>{
      const q=Math.min(1,Math.max(0,x));
      return q**3*(10-15*q+6*q*q);
    }]]
  ]);

  function compile(source) {
    if(typeof source!=='string' || source.length>600) throw new Error('Use an expression of up to 600 characters.');
    const tokens=[];
    const pattern=/\s*(?:(\d+(?:\.\d*)?|\.\d+)([eE][+-]?\d+)?|([a-zA-Z][a-zA-Z0-9]*)|([+*/^(),-]))/y;
    const input=source.trim();
    while(pattern.lastIndex<input.length){
      const start=pattern.lastIndex, match=pattern.exec(input);
      if(!match) throw new Error('Unexpected character at position '+(start+1)+'.');
      tokens.push(match[1]?Number(match[1]+(match[2]||'')):match[3]||match[4]);
      if(tokens.length>240) throw new Error('Use at most 240 expression tokens.');
    }
    let i=0;
    function take(token){
      if(tokens[i]!==token) return false;
      i++;
      return true;
    }
    function expect(token){
      if(!take(token)) throw new Error('Expected “'+token+'”.');
    }
    function sum(){
      let value=product();
      while(tokens[i]==='+' || tokens[i]==='-'){
        const op=tokens[i++], left=value, right=product();
        value=op==='+'?s=>left(s)+right(s):s=>left(s)-right(s);
      }
      return value;
    }
    function product(){
      let value=unary();
      while(tokens[i]==='*' || tokens[i]==='/'){
        const op=tokens[i++], left=value, right=unary();
        value=op==='*'?s=>left(s)*right(s):s=>left(s)/right(s);
      }
      return value;
    }
    function unary(){
      if(take('+')) return unary();
      if(take('-')){
        const value=unary();
        return s=>-value(s);
      }
      const base=atom();
      if(!take('^')) return base;
      const exponent=unary();
      return s=>base(s)**exponent(s);
    }
    function atom(){
      if(take('(')){
        const value=sum();
        expect(')');
        return value;
      }
      const token=tokens[i++];
      if(typeof token==='number'){
        if(!Number.isFinite(token)) throw new Error('Number is outside the supported range.');
        return ()=>token;
      }
      if(token==='pi') return ()=>Math.PI;
      const index=variables.indexOf(token);
      if(index>=0) return s=>s[index];
      const entry=functions.get(token);
      if(!entry) throw new Error(token?'Unexpected token “'+token+'”.':'Expected a number, variable, or function.');
      expect('(');
      const [arity,fn]=entry;
      const args=[sum()];
      for(let j=1;j<arity;j++){
        expect(',');
        args.push(sum());
      }
      expect(')');
      return s=>fn(...args.map(arg=>arg(s)));
    }
    const evaluate=sum();
    if(i!==tokens.length) throw new Error('Unexpected token “'+tokens[i]+'”. Use * for multiplication.');
    return (r,{radius,width,speed,compactness})=>evaluate([r,radius,width,speed,compactness]);
  }

  const bubble='(tanh((r+R)/w) - tanh((r-R)/w)) / (2*tanh(R/w))';
  const defaults={
    alcubierre:{f:bubble},
    natario:{f:bubble},
    pocket:{f:bubble,B:'4 - 3*smooth5((r - 0.35*R)/(0.23*R))'},
    shell:{m:'(C*R/2)*smooth5((r - R + w/2)/w)'}
  };
  function create(family,source){
    if(typeof family!=='string' || !Object.prototype.hasOwnProperty.call(defaults,family)) throw new Error('Choose a supported metric family.');
    if(!source || typeof source!=='object' || Array.isArray(source)) throw new Error('Provide a formula object.');
    const formulas={}, evaluate={};
    for(const key of Object.keys(defaults[family])){
      const expression=Object.prototype.hasOwnProperty.call(source,key) && typeof source[key]==='string'?source[key].trim():'';
      try{evaluate[key]=compile(expression);}
      catch(error){throw new Error(key+'(r) · '+error.message);}
      formulas[key]=expression;
    }
    return {family,formulas,evaluate};
  }
  return {defaults,create,compile};
})();
if(typeof module==='object') module.exports=WarpEquations;
